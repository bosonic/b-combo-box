(function() {
    

    Bosonic.registerElement(
        'b-combo-box',
        {
    options: [],
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
        this.listChanged(this.getAttribute('list'));
        this.appendChild(this.template.content.cloneNode(true));
        this.querySelector('.b-combo-box-toggle').addEventListener('click', this.toggleSuggestionList.bind(this), false);
    },
    attributeChanged: function (name, oldValue, newValue) {
        if (name === 'list')
            this.listChanged(newValue);
    },
    listChanged: function (newValue) {
        var list = document.querySelector('#' + newValue);
        if (list) {
            CustomElements.upgrade(list);
            this.options = Array.prototype.slice.call(list.options, 0);
        }
    },
    paintSuggestionList: function () {
        var list = this.suggestionList;
        while (list.childNodes.length > 0) {
            list.removeChild(list.childNodes[0]);
        }
        this.options.forEach(function (option) {
            var li = document.createElement('li');
            li.innerHTML = option.text || option.value;
            list.appendChild(li);
        });
        if (this.options.length > 0) {
            this.selectable.setAttribute('selected', 0);
        }
    },
    toggleSuggestionList: function () {
        this.suggestionList.hasAttribute('visible') ? this.hideSuggestionList() : this.showSuggestionList();
    },
    showSuggestionList: function () {
        this.paintSuggestionList();
        this.attachListEvents();
        this.suggestionList.setAttribute('visible', '');
        this.selectable.focus();
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
    template: '        <input type="text" value="">        <a class="b-combo-box-toggle">show</a>        <b-selectable target="li">            <ul></ul>        </b-selectable>    '
}
    );
}());