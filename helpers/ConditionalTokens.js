const web3 = require("web3")


function getConditionId(oracle, questionId, outcomeSlotCount){
    return web3.utils.soliditySha3({
        t: 'address',
        v: oracle
    }, {
        t: 'bytes32',
        v: questionId
    }, {
        t: 'uint',
        v: outcomeSlotCount
    })
}

function getCollectionId(conditionId, indexSet){
    return web3.utils.soliditySha3({
        t: 'bytes32',
        v: conditionId
    }, {
        t: 'uint',
        v: indexSet
    })
}

function getIndexSetFromBinaryArray(arr){
    if (arr.find(x => x > 1)){
        throw "Array contains non-binary values"
    } else {
        return Number("0b" + arr.reverse().join(""))
    }
}


module.exports = { getConditionId, getCollectionId, getIndexSetFromBinaryArray}