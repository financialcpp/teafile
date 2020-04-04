let TextEncoder, TextDecoder;
if (typeof window !== undefined) {
    const util = require("util")
    TextEncoder = util.TextEncoder
    TextDecoder = util.TextDecoder
}

const MAGIC_NUMBER = 0x0d0e0a0402080500

const CONSTANTS = {
    EPOCH_JAVA: 719162,
    TICKSPERDAY_JAVA: 86400000,
    TICKSPERDAY_NET: 86400000000,

}

class EnhancedBuffer {
    constructor(buffer, littleEndian = false) {
        this.buffer = buffer
        this.currentViewOffset = 0
        this._littleEndian = littleEndian
    }
    get littleEndian() {
        return this._littleEndian
    }
    set littleEndian(isLittleEndian) {
        this._littleEndian = isLittleEndian
    }
    get byteLength() {
        return this.buffer.byteLength
    }
    get offset() {
        return this.currentViewOffset
    }
    set offset(offset) {
        this.currentViewOffset = offset
    }
    skip8(repeat = 1) {
        this.currentViewOffset = this.currentViewOffset + repeat
        return this
    }
    skip16(repeat = 1) {
        this.currentViewOffset = this.currentViewOffset + (2 * repeat)
        return this

    }
    skip32(repeat = 1) {
        this.currentViewOffset = this.currentViewOffset + (4 * repeat)
        return this

    }
    skip64(repeat = 1) {
        this.currentViewOffset = this.currentViewOffset + (8 * repeat)
        return this

    }
    back64(repeat = 1) {
        this.currentViewOffset = this.currentViewOffset - (8 * repeat)
        return this

    }
    get uint8() {
        let offset = this.currentViewOffset
        let view = new DataView(this.buffer, offset)
        let val = view.getUint8(0, this.littleEndian)
        this.skip8()
        return val
    }
    get uint16() {
        let offset = this.currentViewOffset
        let view = new DataView(this.buffer, offset)
        let val = view.getUint16(0, this.littleEndian)
        this.skip16()
        return val

    }
    get uint32() {
        let offset = this.currentViewOffset
        let view = new DataView(this.buffer, offset)
        let val = view.getUint32(0, this.littleEndian)
        this.skip32()
        return val
    }
    get uint64() {
        return Number(this.bigUint64)
    }
    get bigUint64() {
        let offset = this.currentViewOffset
        let view = new DataView(this.buffer, offset)
        let val = view.getBigUint64(0, this.littleEndian)
        this.skip64()
        return val
    }
    get float32() {
        let offset = this.currentViewOffset
        let view = new DataView(this.buffer, offset)
        let val = view.getFloat32(0, this.littleEndian)
        this.skip32()
        return val

    }
    get float64() {
        let offset = this.currentViewOffset
        let view = new DataView(this.buffer, offset)
        let val = view.getFloat64(0, this.littleEndian)
        this.skip64()
        return val

    }
    readInt8() {
        return Uint8Array
    }
    readInt16() {

    }
    readInt32() {

    }
    readBigInt64() {

    }
    readFloat32() {

    }
    consumeFloat64() {

    }
    consumeInt8Absolute() {

    }
    consumeInt16Absolute() {

    }
    consumeInt32Absolute() {

    }
    consumeBigIntAbsolute() {

    }
    consumeFloat32Absolute() {

    }
    consumeFloat64Absolute() {

    }
    readFloat64() {

    }
    readInt8Absolute() {

    }
    readInt16Absolute() {

    }
    readInt32Absolute() {

    }
    readBigIntAbsolute() {

    }
    readFloat32Absolute() {

    }
    readFloat64Absolute() {

    }
}

class Header {
    constructor() {
        this.numSections = null
        this.isTeafile = false

        // I know these are long names but I want it to be clear
        // that the offset is referring from the beginning of the buffer
        // That's what I mean by absolute
        this.itemAreaOffsetStart = null
        this.itemAreaOffsetEnd = 0
    }
    static fromBuffer(buffer) {
        let header = new Header()
        return header.fromBuffer(buffer)
    }
    fromBuffer(buffer) {
        if (buffer.byteLength !== 32) {

        }

        this.magicNumber = buffer.uint64

        // first assume big endian
        if (!this.magicNumberValid) {

            buffer.littleEndian = true
            this.magicNumber = buffer.back64().uint64
            if (!this.magicNumberValid) {
                throw new Error("Magic number is not valid. Buffer is not a TeaFile buffer. Magic Number provided: ", this.magicNumber)
            }
        }
        this.itemAreaOffsetStart = buffer.uint64

        // skip Itemend because we don't care
        buffer.skip64()

        this.numSections = buffer.uint64

        return this
    }

    toBuffer(args) {
        return new Header(args)
    }

    get magicNumberValid() {
        return this.magicNumber == MAGIC_NUMBER
    }
}

// Helpers. not sure where they fit in yet
const parseText = (enhancedBuffer) => {
    let numBytesName = buffer.int32
    // ASCII-only right now so can use utf-8
    let uint8 = new Uint8Array(numBytesName)
    for (let i = 0; i < numBytesName; i++) {
        uint8[i] = enhancedBuffer.uint8
    }
    return (new TextDecoder("utf-8")).decode(uint8)
}

const extractField = (buffer, type) => {
    switch (type) {
        // Int8
        case 1:
            return buffer.int8
        // Int16
        case 2:
            return buffer.int16
        // Int32
        case 3:
            return buffer.int32
        // Int64
        case 4:
            return buffer.int64
        // UInt8
        case 5:
            return buffer.uint8
        // UInt16
        case 6:
            return buffer.uint16
        // UInt32
        case 7:
            return buffer.uint32
        // UInt64
        case 8:
            return buffer.uint64
        // Float32 (IEEE 754)
        case 9:
            return buffer.float32
        // Float64 (IEEE 754)
        case 10:
            return buffer.float64
        default:
            throw new Error(`Unrecognized field type: ${type}. Custom field types not implemented yet.`)
    }
}


class Section {
    stringToBuffer(str) {
        // Returns a Uint8Buffer.buffer
        return new TextEncoder("utf-8").encode(str).buffer
    }
}

class ItemSection extends Section {
    constructor(options) {
        super(options)
    }

    static fromBuffer(buffer) {
        this.buffer = buffer

        let sectionId = buffer.uint32

        // bad sectionId, throw error
        if (this.constructor.sectionId !== sectionId) {
            throw new Error(`Bad sectionId supplied for ${this.name}, found: ${sectionId}`)
        }

        this.nextSectionOffset = buffer.uint32

        // total byte size of the items
        this.itemSize = buffer.uint32

        // the name of the item
        this.itemName = parseText(buffer)

        // how many fields per item
        this.numFields = buffer.uint32

        this.fields = []

        for (let i = 0; i < numFields; i++) {
            // we could potentially make each type its own class eventually
            let field = {
                type: buffer.int32,
                offset: buffer.int32,
                name: parseText(buffer)
            }
            fields.push(field)
        }
    }

    static get name() {
        return "ItemSection"
    }
    get name() {
        return "ItemSection"
    }
    static get sectionId() {
        return 0x0a
    }
}

class TimeSection extends Section {
    constructor(options) {
        super(options)
    }
    static get name() {
        return "TimeSection"
    }
    get name() {
        return "TimeSection"
    }
    static get sectionId() {
        return 0x40
    }
}
class DescriptionSection extends Section {
    constructor(options) {
        super(options)
    }
    static get name() {
        return "DescriptionSection"
    }
    get name() {
        return "DescriptionSection"
    }
    static get sectionId() {
        return 0x80
    }

}

class NameValueSection extends Section {
    constructor(options) {
        super(options)
    }
    static get name() {
        return "NameValueSection"
    }
    get name() {
        return "NameValueSection"
    }

    static get sectionId() {
        return 0x81
    }
}

class TeaFileImpl {
    constructor({
        filename = "",
        sections = TeaFileImpl.sections,
        time = {
            epoch: CONSTANTS.EPOCH_JAVA,
            ticksPerDay: CONSTANTS.TICKSPERDAY_NET
        },
        itemDescription = null,
        nameValues = {},
        buffer = null
    } = {}) {
        this.items = []

        if (buffer) {
            init(buffer)
        }
    }
    static get MAGIC_NUMBER() {
        return MAGIC_NUMBER
    }
    get MAGIC_NUMBER() {
        return MAGIC_NUMBER
    }

    static fromBuffer(buffer, sections = TeaFileImpl.sections) {
        if (buffer.byteLength < 4) {
            throw new Error("Buffer has no mandatory header")
        }

        let teafile = new TeaFileImpl()
        return teafile.fromBuffer(buffer, sections)

    }
    fromBuffer(buffer, sections) {
        return this
    }
    init(buffer) {
        let results = this.parseBuffer(buffer)
        Object.keys(results).map(k => {
            this[k] = results[k]
        })
        return
    }
    parseBuffer(buffer) {

        let results = {

            // we'll store each parsed section by its id here
            sections: {
                // eg:
                /*
                [sectionId]: SectionType.fromBuffer(buffer)
                */
            },
            data: []
        }

        let buffer = new EnhancedBuffer(buffer)

        // each section consumes the buffer and moves it along until it is fully consumed
        results.header = Header.fromBuffer(buffer)

        // the first section starts at 32 bytes
        buffer.offset = 32
        for (let i = 0; i < header.numSections.length; i++) {
            // first get the sectionId
            let sectionId = buffer.uint32


            if (sectionId in TeaFileImpl.sectionsBySectionId) {

                // go back because the section expects the buffer's offset
                // to be located right before the sectionId so that it can
                // read it and validate it
                buffer.back32()


                results.sections[sectionId] = TeaFileImpl.sectionsBySectionId[sectionId].fromBuffer(buffer)
            } else {
                // we don't know how to parse this section type, skip to next
                // section
                let currentOffset = buffer.offset
                let nextSectionOffset = buffer.int32

                // skip to the next section
                buffer.offset = currentOffset + nextSectionOffset

                // so here what we can do is if people want to extend the known sections, we just tell them to extend TeaFileImpl.sections with their new section types
            }

            // Each section class is responsible for moving the buffer along
            // ie. consume the buffer so that the following section can just
            // start parsing their own section without worrying about what 
            // happened before it


        }

        // once we are here, each section should in theory be fully consumed

        // we can use the whole buffer length minus the itemAreaOffsetStart
        // found in the Header to find how many items are in the item area

        let itemAreaByteLength = buffer.byteLength - results.header.itemAreaOffsetStart

        let itemSize = results.sections[ItemSection.sectionId].itemSize

        let numItems = itemAreaByteLength / itemSize

        for (let i = 0; i < numItems; i++) {
            // set the buffer to the start of the item
            buffer.offset = results.header.itemAreaOffsetStart + itemSize * i

            // save the item's offset start
            let itemOffsetStart = buffer.offset

            let item = {}
            let fields = results.sections[ItemSection.sectionId].fields
            fields.forEach(field => {
                // this will guarantee we are always reading the field
                // at the correct offset within the item
                buffer.offset = itemOffsetStart + field.offset
                item[field.name] = extractField(buffer, field.type)
            })

            results.data.push(item)
        }

        return results
    }
}

TeaFileImpl.sections = {
    [ItemSection.name]: ItemSection,
    [TimeSection.name]: TimeSection,
    [DescriptionSection.name]: DescriptionSection,
    [NameValueSection.name]: NameValueSection
}
TeaFileImpl.sectionsBySectionId = {
    [ItemSection.sectionId]: ItemSection,
    [TimeSection.sectionId]: TimeSection,
    [DescriptionSection.sectionId]: DescriptionSection,
    [NameValueSection.sectionId]: NameValueSection
}


module.exports = {
    TeaFileImpl,
    Section,
    Header,
    ...TeaFileImpl.sections,
    CONSTANTS,
    EnhancedBuffer
};