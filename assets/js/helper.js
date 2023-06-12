// jQuery would've, possibly, reduced the volume of helper functions

function addElementClassIfNotExist(el, _class) {
    if(!doesElementHaveClass(el, _class)) {
        el.classList.add(_class);
        return true;
    }
    return false;
}

function doesElementHaveClass(el, _class) {
    return el.classList.contains(_class);
}

function removeElementClassIfExist(el, _class) {
    if(doesElementHaveClass(el, _class)) {
        el.classList.remove(_class);
    }
    return true;
}