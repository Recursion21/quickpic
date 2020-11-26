// helper functions

// clear node and everything inside it
// helper function to clear everything inside a node
const clear = (node) => {
    while (node.hasChildNodes()) {
        clear(node.firstChild);
    }
    node.parentNode.removeChild(node);
}

// clear node and everything inside it
export const clearInner = (node) => {
    while (node.hasChildNodes()) {
        clear(node.firstChild);
    }
}

// convert from epoch time format to normal date format
export const convertDate = (epochDate) => {
    let date = new Date(epochDate * 1000);
    return date.toLocaleDateString("en-AU");
}

