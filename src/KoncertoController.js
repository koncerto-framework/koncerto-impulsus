/**
 * KoncertoController
 * Connect html element to JavaScript
 *
 * @param {Node} element
 */
function KoncertoController(element)
{
    var targets = {};
    element.querySelectorAll('[data-target]').forEach(function (target) {
        targets[target.getAttribute('data-target')] = target;
    });
    element.setAttribute('data-bind', 'true');

    var controllerName = new String(element.getAttribute('data-controller')).toLowerCase();
    if (controllerName in KoncertoImpulsus.controllers) {
        setTimeout(function() {
            element.controller.default = KoncertoImpulsus.controllers[controllerName];
            element.controller.default(element.controller);
        }, 100);
    } else {
        // var currentPath = new String(location.href);
        // var parts = currentPath.split('/');
        // if ('' !== parts[parts.length - 1]) {
        //     parts.pop();
        //     currentPath = parts.length > 0 ? parts.join('/') : '';
        // }
        // if (!currentPath.endsWith('/_controller/')) {
        //     currentPath += '/_controller/';
        // }
        var controllerFile = '_controller/' + controllerName + '.js';
        KoncertoImpulsus.fetch(controllerFile, {
            source: element
        }, function(response, source) {
            var isError = false;
            try {
                source.controller.default = eval('(function(controller) { ' + response.responseText + ' });')(source.controller);
                KoncertoImpulsus.controllers[controllerName] = source.controller.default;
                source.controller.default(source.controller);
            } catch (e) {
                isError = true;
            }
             if ((isError || 404 === response.status) && element.hasAttribute('data-proxy')) {
                KoncertoImpulsus.fetch(element.getAttribute('data-proxy').replace('%s', controllerFile), {
                    source: element
                }, function(response, source) {
                    source.controller.default = eval('(function(controller) { ' + response.responseText + ' });')(source.controller);
                    KoncertoImpulsus.controllers[controllerName] = source.controller.default;
                    source.controller.default(source.controller);
                });
                return;
            }

        });
    }

    var controller = {
        element,
        targets,
        default: null,
        on: function(method, callback) {
            window.addEventListener('message', function(event) {
                if ('object' !== typeof event.data) {
                    return;
                }
                if (!('id' in event.data)) {
                    return;
                }
                if (!('controller' in event.data)) {
                    return;
                }
                if (!('method' in event.data)) {
                    return;
                }
                if (method !== event.data.method) {
                    return;
                }
                var element = this.document.querySelector('[data-id=' + event.data.id + ']');
                element.removeAttribute('data-id');
                callback(element.controller);
            });
        }
    };

    var actions = element.querySelectorAll('[data-action]');
    actions.forEach(function (element) {
        if (!element.hasAttribute('data-bind')) {
            element.setAttribute('data-bind', 'true');
            var parts = element.getAttribute('data-action').split('#');
            var controller = parts[0];
            parts = controller.split('->');
            controller = 1 === parts.length ? parts[0] : parts[1];
            var action = 1 === parts.length ? 'click' : parts[0];
            element.addEventListener(action, function(event) {
                var el = event.target.hasAttribute('data-action') ? event.target : event.target.closest('[data-action]');
                var parts = new String(el.getAttribute('data-action')).split('#');
                var controller = parts[0];
                var method = 1 === parts.length ? 'default' : parts[1];
                parts = controller.split('->');
                controller = 1 === parts.length ? parts[0] : parts[1];
                var element = el.closest('[data-controller=' + controller + ']');
                if (null === element) {
                    console.error('Controller ' + controller + ' not found. Please check that target is inside controller.');
                    return;
                }
                element.setAttribute('data-id', controller + '-' + (new Date()).getTime());
                window.postMessage({
                    id: element.getAttribute('data-id'),
                    controller,
                    method
                });
            });
        }
    });

    return controller;
}

window.KoncertoController = KoncertoController;
