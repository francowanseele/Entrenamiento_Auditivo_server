const printArray = (arr) => {
    var str = '[ ';
    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        str += element;
        if (i < arr.length - 1) {
            str += ', ';
        }
    }
    str += ' ]';
    console.log(str);
};

const printError = (err) => {
    console.log('------------------------------');
    console.log(err);
    console.log('------------------------------');
};

const getRandom = (notas) => {
    const rdm = Math.floor(Math.random() * 10000 + 1); // nro random de 4 cifras
    if (notas.length === 0) {
        return null;
    }
    return notas[rdm % notas.length];
};

const getElemPrioridad = (elems) => {
    var elemsPrioridad = [];
    elems.forEach((elem) => {
        for (let i = 0; i < elem.prioridad; i++) {
            elemsPrioridad.push(elem.elem);
        }
    });

    return getRandom(elemsPrioridad);
};

const removeItemFromArr = (originalArr, item) => {
    var arr = JSON.parse(JSON.stringify(originalArr));
    if (arr.length == 0) return null;
    
    var i = arr.indexOf(item);

    if (i !== -1) {
        arr.splice(i, 1); // 2nd parameter means remove one item only
    }

    return arr;
};

const removeAllItemsFromArr = (arr, item) => {
    let res = [];
    arr.forEach(elem => {
        if (elem != item) {
            res.push(elem);
        }
    });

    return res;
};

const removeItemFromArrRegla = (arrayRegla, elem) => {
    var res = [];
    arrayRegla.forEach((elemRegla) => {
        if (elemRegla.elem != elem) {
            res.push(elemRegla);
        }
    });

    return res;
};

module.exports = {
    printArray,
    printError,
    getRandom,
    getElemPrioridad,
    removeItemFromArr,
    removeAllItemsFromArr,
    removeItemFromArrRegla,
};
