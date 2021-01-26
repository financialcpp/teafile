const { Teafile, Section, Header, EnhancedBuffer } = require('../lib')

const fs = require('fs')

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

describe('class Header', function () {
    describe('fromBuffer', function () {
        it('should not throw on valid buffer', function () {

            /**
             * Magic Number:    940700384497239296n
             * Item Area Start: 32n
             * Item Area End:   0n,
             * Sections Count:  3n (3 sections)
             */
            let buffer = (new BigUint64Array([940700384497239296n, 32n, 0n, 3n])).buffer
            
            assert.doesNotThrow(() => Header.fromBuffer(new EnhancedBuffer(buffer)))
        })
    })

})

describe('class Section', function () {
    describe('function stringToBuffer', function () {
        it('ascii: should return charCode 97 for letter a', function () {

            let section = new Section()
            let str = 'a'
            let charCode = 97

            let buffer = new Uint8Array(section.stringToBuffer(str))
            let value = buffer[0]
            assert.strictEqual(value, charCode)
        })
        it('utf-8: should return a buffer with [ 226, 130, 130 ] for subscript ₂', function () {
            let section = new Section()
            let str = '₂'
            let testBuffer = [226, 130, 130] // this is the utf value for the subscript above
    
            let buffer = new Uint8Array(section.stringToBuffer(str))
            assert.strictEqual(buffer[0] == testBuffer[0] && buffer[1] == testBuffer[1] && buffer[2] == testBuffer[2], true)
        })
    })

})
describe('class Teafile', function () {
    describe('fromBuffer', function () {
        it('takes a buffer', function () {

            let tf = Teafile.fromBuffer()
            let str = 'a'
            let charCode = 97

            let buffer = new Uint8Array(section.stringToBuffer(str))
            let value = buffer[0]
            assert.strictEqual(value, charCode)
        })
        it('utf-8: should return a buffer with [ 226, 130, 130 ] for subscript ₂', function () {
            let section = new Section()
            let str = '₂'
            let testBuffer = [226, 130, 130] // this is the utf value for the subscript above
    
            let buffer = new Uint8Array(section.stringToBuffer(str))
            assert.strictEqual(buffer[0] == testBuffer[0] && buffer[1] == testBuffer[1] && buffer[2] == testBuffer[2], true)
        })
    })

})



describe('read mandatory header', function () {
    describe('magic number', function () {
        it('should return 0x0d0e0a0402080500 at first 8 bytes', function () {
            
        });
    });
});