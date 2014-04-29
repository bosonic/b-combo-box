(function () {
    function normalizeTokens(tokens) {
        return tokens.filter(function (token) {
            return !!token;
        }).map(function (token) {
            return token.toLowerCase();
        });
    }
    function newIndexNode() {
        return {
            ids: [],
            children: {}
        };
    }
    function buildIndex(options) {
        var index = newIndexNode();
        options.forEach(function (option, id) {
            var val = option.text || option.value, tokens = normalizeTokens(val.split(/\s+/));
            tokens.forEach(function (token) {
                var ch, chars = token.split(''), node = index;
                while (ch = chars.shift()) {
                    node = node.children[ch] || (node.children[ch] = newIndexNode());
                    node.ids.push(id);
                }
            });
        });
        return index;
    }
    function find(query, index, options) {
        var matches, tokens = normalizeTokens(query.split(/\s+/));
        tokens.forEach(function (token) {
            var node = index, ch, chars = token.split('');
            if (matches && matches.length === 0) {
                return false;
            }
            while (node && (ch = chars.shift())) {
                node = node.children[ch];
            }
            if (node && chars.length === 0) {
                ids = node.ids.slice(0);
                matches = matches ? getIntersection(matches, ids) : ids;
            } else {
                matches = [];
                return false;
            }
        });
        return matches ? unique(matches).map(function (id) {
            return options[id];
        }) : [];
    }
    function unique(array) {
        var seen = {}, uniques = [];
        for (var i = 0; i < array.length; i++) {
            if (!seen[array[i]]) {
                seen[array[i]] = true;
                uniques.push(array[i]);
            }
        }
        return uniques;
    }
    function getIntersection(arrayA, arrayB) {
        var ai = 0, bi = 0, intersection = [];
        arrayA = arrayA.sort(compare);
        arrayB = arrayB.sort(compare);
        while (ai < arrayA.length && bi < arrayB.length) {
            if (arrayA[ai] < arrayB[bi]) {
                ai++;
            } else if (arrayA[ai] > arrayB[bi]) {
                bi++;
            } else {
                intersection.push(arrayA[ai]);
                ai++;
                bi++;
            }
        }
        return intersection;
        function compare(a, b) {
            return a - b;
        }
    }
    Bosonic.registerElement('b-combo-box', {
        get options() {
            var list = document.querySelector('#' + this.getAttribute('list'));
            if (list && list.options) {
                CustomElements.upgrade(list);
                return Array.prototype.slice.call(list.options, 0);
            }
            return [];
        },
        get index() {
            if (!this.__index) {
                this.__index = buildIndex(this.options);
            }
            return this.__index;
        },
        get suggestionList() {
            return this.querySelector('ul');
        },
        get selectable() {
            return this.querySelector('b-selectable');
        },
        get input() {
            return this.querySelector('input[type=text]');
        },
        readyCallback: function () {
            this.appendChild(this.template.content.cloneNode(true));
            this.querySelector('.b-combo-box-toggle').addEventListener('click', this.toggleSuggestionList.bind(this), false);
            this.input.addEventListener('input', this.onInputChange.bind(this), false);
        },
        onInputChange: function (e) {
            e.stopPropagation();
            if (!this.suggestionList.hasAttribute('visible')) {
                this.showSuggestionList();
                this.input.focus();
            } else {
                this.refreshSuggestionList();
            }
        },
        filterOptions: function () {
            var query = this.input.value;
            if (!query)
                return this.options;
            return find(query, this.index, this.options);
        },
        paintSuggestionList: function () {
            var list = this.suggestionList, options = this.filterOptions();
            while (list.childNodes.length > 0) {
                list.removeChild(list.childNodes[0]);
            }
            options.forEach(function (option) {
                var li = document.createElement('li');
                li.innerHTML = option.text || option.value;
                list.appendChild(li);
            });
            if (options.length > 0) {
                this.selectable.setAttribute('selected', 0);
            }
        },
        refreshSuggestionList: function () {
            this.paintSuggestionList();
        },
        toggleSuggestionList: function () {
            this.suggestionList.hasAttribute('visible') ? this.hideSuggestionList() : this.showSuggestionList();
        },
        showSuggestionList: function () {
            this.paintSuggestionList();
            this.attachListEvents();
            this.suggestionList.setAttribute('visible', '');
        },
        hideSuggestionList: function () {
            this.suggestionList.removeAttribute('visible');
        },
        attachListEvents: function () {
            this.selectable.addEventListener('b-activate', this.pickSuggestion.bind(this), false);
        },
        pickSuggestion: function (e) {
            this.input.value = this.getItemValue(e.detail.item);
            this.hideSuggestionList();
        },
        getItemValue: function (itemIndex) {
            return this.querySelectorAll('li')[itemIndex].innerHTML;
        },
        template: ' <input type="text" value=""> <a class="b-combo-box-toggle">show</a> <b-selectable target="li"> <ul></ul> </b-selectable> '
    });
}());