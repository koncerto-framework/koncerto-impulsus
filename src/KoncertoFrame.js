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

    var links = document.querySelectorAll('a[href]');
    links.forEach(function (link) {
        if (!link.hasAttribute('data-frame')) {
            link.setAttribute('data-frame', frame.id);
        }
        link.addEventListener('click', function(event) {
            KoncertoImpulsus.fetch(event.target.href, false, function (response) {
                var id = event.target.getAttribute('data-frame');
                var frame = document.getElementById(id);
                frame.setAttribute('data-href', response.responseURL);
                var html = document.createElement('html');
                html.innerHTML = response.responseText;
                var title = html.querySelector('head > title');
                if (null !== title) {
                    document.title = title.innerText;
                }
                var section = html.querySelector('section#' + id)
                if (null === section) {
                    console.info('No section for frame id ' + id + ' found, loading default section');
                    section = html.querySelector('section')
                }
                if (null === section) {
                    console.info('No section found, loading whole content');
                    section = html;
                }
                frame.innerHTML = section.innerHTML;
                if (KoncertoImpulsus.location !== response.responseURL) {
                    history.pushState(null, '', response.responseURL);
                    KoncertoImpulsus.history.unshift({ frame: id, href: response.responseURL, title: document.title, html: frame.innerHTML });
                    KoncertoImpulsus.location = response.responseURL;
                }
            });
            event.preventDefault();
            event.stopPropagation();
        });
    });

    return frame;
}

window.KoncertoFrame = KoncertoFrame;
