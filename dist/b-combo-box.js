(function() {
    

    Bosonic.registerElement(
        'b-combo-box',
        {
    options: [],
    get suggestionList() {
        return this.querySelector('ul');
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
    },
    toggleSuggestionList: function () {
        this.suggestionList.hasAttribute('visible') ? this.hideSuggestionList() : this.showSuggestionList();
    },
    showSuggestionList: function () {
        this.paintSuggestionList();
        this.suggestionList.setAttribute('visible', '');
    },
    hideSuggestionList: function () {
        this.suggestionList.removeAttribute('visible');
    },
    template: '        <input type="text" value="">        <a class="b-combo-box-toggle">show</a>        <b-selectable target="li">            <ul></ul>        </b-selectable>    '
}
    );
}());