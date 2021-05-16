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

const removeItemFromArr = (arr, item) => {
    var i = arr.indexOf(item);

    if (i !== -1) {
        arr.splice(i, 1);
    }
};

module.exports = {
    printArray,
    printError,
    getRandom,
    getElemPrioridad,
    removeItemFromArr,
};
