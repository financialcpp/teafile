const { TeaFileImpl } = require('./implementation.js')

class TeaFile {
    constructor({
        filename = "",
        itemSpec = {},
        timeSpec = { epoch: 719162, ticksPerDay: 86400000 },
        itemDescription = '',
        nameValues = {},
        buffer = null
    } = {}) {
        this._impl = new TeaFileImpl({
            filename,
            itemSpec,
            timeSpec,
            itemDescription,
            nameValues,
            buffer
        })
    }

    get CONSTANTS() {
        return
    }

    static create(filename = "", itemSpec, timeSpec = { epoch: 719162, ticksPerDay: 86400000 }, itemDescription = "", nameValues = {}) {
        let teafile = new TeaFile({
            filename,
            itemSpec,
            timeSpec,
            itemDescription,
            nameValues
        })
        return teafile
    }

    write(...values) {
        console.log();
    }

    toBuffer() {
        return this._impl.toBuffer()
    }
    // static fromBuffer(buffer) {
    //     const teafile = new TeaFile()

    //     return new TeaFile(buffer)
    // }
    fromBuffer(buffer) {
        this._impl.fromBuffer(buffer)
    }
}


exports = module.exports = TeaFile