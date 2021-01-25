const { Teafile, Section, Header, EnhancedBuffer } = require('../lib')

const assert = require('assert');

describe('class EnhancedBuffer', function () {
    describe('getters', function () {
        let buffer = new EnhancedBuffer((new Uint8Array([
            1, 2, 3, 4
        ])).buffer)
        it('uint8 getter should consume 1 byte', function () {
            assert.equal(buffer.uint8, 1)
            assert.equal(buffer.uint8, 2)
            assert.equal(buffer.uint8, 3)
            assert.equal(buffer.uint8, 4)
        })

        let buffer2 = new EnhancedBuffer((new Uint8Array([
            0b00000001, 0b00000010,
            0b00000011, 0b00000100
        ])).buffer)
        it('uint16 getter should consume 2 bytes', function () {
            assert.equal(buffer2.uint16, 0b0000000100000010)
            assert.equal(buffer2.uint16, 0b0000001100000100)
        })
        let buffer3 = new EnhancedBuffer((new Uint8Array([
            0b00000001, 0b00000010, 0b00000011, 0b00000100,
            0b00000001, 0b00000010, 0b00000011, 0b00000101
        ])).buffer)
        it('uint32 getter should consume 4 bytes', function () {
            assert.equal(buffer3.uint32, 0b00000001000000100000001100000100)
            assert.equal(buffer3.uint32, 0b00000001000000100000001100000101)
        })
        let buffer4 = new EnhancedBuffer((new Uint8Array([
            0b00000001, 0b00000010, 0b00000011, 0b00000100, 0b00000001, 0b00000010, 0b00000011, 0b00000101,

        ])).buffer)
        it('bigUint64 getter should consume 8 bytes', function () {
            assert.equal(buffer4.bigUint64, 72623859723010821n)
        })
        let buffer5 = new EnhancedBuffer((new Uint8Array([
            0b00000001, 0b00000010, 0b00000011, 0b00000100, 0b00000001, 0b00000010, 0b00000011, 0b00000101,

        ])).buffer)
        it('uint64 getter should consume 8 bytes', function () {
            assert.equal(buffer5.uint64, 0b0000000100000010000000110000010000000001000000100000001100000101)
        })
    })
})

describe('class Teafile', function () {
    describe('', function () {
    

    })
})

// describe('Header class', function () {
    // describe('fromBuffer', function () {
    // it('should return charCode 97 for letter a', function () {

    //     Header.fromBuffer((new BigUint64Array([940700384497239296n, 32n, 0n, 3n])).buffer)
    //     // let str = 'a'
    //     // let charCode = 97

    //     // let buffer = new Uint8Array(section.stringToBuffer(str))
    //     // let value = buffer[0]
    //     // assert.equal(value, charCode)
    // })
    // })

//     describe('stringToBuffer', function () {
//         it(' should return a buffer with [ 226, 130, 130 ] for subscript ₂', function () {
//             let section = new Section()
//             let str = '₂'
//             let testBuffer = [226, 130, 130]

//             let buffer = new Uint8Array(section.stringToBuffer(str))
//             let isGood = false
//             isGood = buffer[0] == testBuffer[0]
//             isGood = buffer[1] == testBuffer[1]
//             isGood = buffer[2] == testBuffer[2]
//             assert.equal(isGood, true)
//         })
//     })
// })
// describe('Section class', function () {
//     describe('stringToBuffer', function () {
//         it('should return charCode 97 for letter a', function () {

//             let section = new Section()
//             let str = 'a'
//             let charCode = 97

//             let buffer = new Uint8Array(section.stringToBuffer(str))
//             let value = buffer[0]
//             assert.equal(value, charCode)
//         })
//     })

//     describe('stringToBuffer', function () {
//         it(' should return a buffer with [ 226, 130, 130 ] for subscript ₂', function () {
//             let section = new Section()
//             let str = '₂'
//             let testBuffer = [226, 130, 130]

//             let buffer = new Uint8Array(section.stringToBuffer(str))
//             let isGood = false
//             isGood = buffer[0] == testBuffer[0]
//             isGood = buffer[1] == testBuffer[1]
//             isGood = buffer[2] == testBuffer[2]
//             assert.equal(isGood, true)
//         })
//     })
// })

// describe('read mandatory header', function () {
//     describe('magic number', function () {
//         it('should return 0x0d0e0a0402080500 at first 8 bytes', function () {
//             assert.equal(0x0d0e0a0402080500, TeaFileImpl.MAGIC_NUMBER);
//             assert.equal(0x0d0e0a0402080500, teafile.MAGIC_NUMBER);
//         });
//     });
// });