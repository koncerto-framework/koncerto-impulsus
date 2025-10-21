/**
 * KoncertoFrame
 * Creates a dynamic frame/area
 *
 * @param {Node} section
 */
function KoncertoFrame(section)
{
    var id = new String(section.hasAttribute('id') ? section.getAttribute('id') : 'frame-' + new Date().getTime());
    section.setAttribute('id', id);
    KoncertoImpulsus.history.push({ frame: id, href: location.href, title: document.title, html: section.innerHTML });

    var frame = {
        id,
        section
    };

    var links = section.querySelectorAll('a[href]');
    links.forEach(function (link) {
        var href = link.getAttribute('href');
        if (href.startsWith('http:') || href.startsWith('https:')) {
            return;
        }
        if (!link.hasAttribute('data-frame')) {
            link.setAttribute('data-frame', frame.id);
        }
        link.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            var href = event.target.getAttribute('href');
            var proxy = '%s';
            var frame = document.getElementById(id);;
            if (frame.hasAttribute('data-proxy')) {
                proxy = frame.getAttribute('data-proxy');
            }
            function parseResponse(id, url, html) {
                var frame = document.getElementById(id);
                frame.setAttribute('data-href', url);
                var root = document.createElement('html');
                root.innerHTML = html;
                var title = root.querySelector('head > title');
                if (null !== title) {
                    document.title = title.innerText;
                }
                var section = root.querySelector('section#' + id)
                if (null === section) {
                    console.info('No section for frame id ' + id + ' found, loading default section');
                    section = root.querySelector('section');
                }
                if (null === section) {
                    console.info('No section found, loading whole content');
                    section = root;
                }
                frame.innerHTML = section.innerHTML;
                if (KoncertoImpulsus.location !== url) {
                    history.pushState(null, '', url);
                    KoncertoImpulsus.history.unshift({ frame: id, href: url, title: document.title, html: frame.innerHTML });
                    KoncertoImpulsus.location = url;
                }
            }
            // Proxy is a controller function (requires a controller)
            if (0 === proxy.indexOf('@')) {
                proxy = proxy.substring(1);
                var controllerElement = frame.closest('[data-controller]');
                if (controllerElement && proxy in controllerElement.controller && 'function' === typeof controllerElement.controller[proxy]) {
                    controllerElement.controller[proxy](href, function(html) {
                        parseResponse(event.target.getAttribute('data-frame'), href, html);
                    });

                    return;
                }
            }
            KoncertoImpulsus.fetch(proxy.replace('%s', href), false, function (response) {
                parseResponse(event.target.getAttribute('data-frame'), response.responseURL, response.responseText);
            });
        });
    });

    return frame;
}

window.KoncertoFrame = KoncertoFrame;
