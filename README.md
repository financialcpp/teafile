![npm](https://img.shields.io/npm/v/teafile)

# teafile
teafile - pure javascript api for the teafile format

> teatime file format is designed and maintained by [DiscreteLogics](http://discretelogics.com/teafiles/). I have no affiliation with them.

Keep reading if you want to learn about the following:

- how to use the library 
- what is the teafile format and use cases

## how to use the library 

### Install

```bash
npm install teafile
```

### Read a teafile from a buffer
```js
import teafile from 'teafile'

// assume you have the binary data in a buffer
let binaryData = ArrayBuffer(length)

let data = teafile.fromBuffer(binaryData)
console.log(data)
/*
data = {
    itemDescription: "Time Price Flag",
    nameValues: {
        "Ticker": "AAPL,
        "Decimals": 2
    },
    timeScale: {
        epoch: 719162 (1970),
        ticksPerDay: 86400000
    },
    data: {
        Time: [...],
        Price: [...],
        Flag: [...]
    }
}
*/
```

### Write a teafile to a buffer
```js
import teafile from 'teafile'

let file = new teafile()

file.itemDescription = "Time Price Flag"
file.epoch(719162)
file.nameValue("Ticker", "AAPL")
file.nameValue("Decimals", 2)
file.write(450959595, 23.51, 1)
file.write(450959595, 23.51, 1)

let data = file.toBuffer(file)
console.log(data)
// [ <binary data> ]


// You could upload the data to a server
import axios from 'axios'
axios.post(`/endpoint/teafile`, {data})

```

### Pretty-print a summary of the file to the console (good for debugging)
```js
import teafile from 'teafile'

// assume you have the binary data in a buffer
let binaryData = ArrayBuffer(...)

let data = teafile.fromBuffer(binaryData)
console.log(data.summary())

/*
data = {
    itemDescription: "Time Price Flag",
    nameValues: {
        "Ticker": "AAPL,
        "Decimals": 2
    },
    timeScale: {
        epoch: 719162 (1970),
        ticksPerDay: 86400000
    },
    data: {
        Time: [...],
        Price: [...],
        Flag: [...]
    }
}

*/

```

## what is the teafile format and use cases

### TeaFile is a file format to store time series in binary flat files
- An optional header holds a description of file contents such as a description of the item type layout (schema) and metadata (key/value pairs) as well as metadata about the format for the datetime part of the format.
- The file format is designed to be simple so that APIs are created easily (I agree with this)
- DiscreteLogics publishes the format and releases APIs for C#, C++ and Python under the GPL.
  
I'll describe at a high level, how this format stores your data and what you might want to use it for.

### high-level overview of the format
I highly encourage anyone to read the exact specification for the TeaFile format - check it out here: [http://discretelogics.com/resources/teafilespec/](http://discretelogics.com/resources/teafilespec/). I think it is written clearly and concisely.

TeaFiles start with a header followed by optional sections, and finally the item area holding the time series data in binary format.

#### header (mandatory)

The header is mandatory. Any `teafile` that doesn't contain the information below in the first 32 bytes of the file is ill-formed.

| bytes | Description   |                                                                                     |
| ----- | ------------- | ----------------------------------------------------------------------------------- |
| 8     | Magic value   | Mandatory: 0x0d0e0a0402080500. Is also used to determine the endianness of the file |
| 8     | Item Start    | Specify the byte offset that the items start at                                     |
| 8     | Item End      | Specify the byte offset that the items end at                                       |
| 8     | Section Count | Here you specify how many *sections* follow below                                   |

#### sections (optional)

The sections are optional. There are four section types and they cannot be repeated:

| Name                | Hexadecimal representation | What is it for?                                                    |
| ------------------- | -------------------------- | ------------------------------------------------------------------ |
| Item Section        | 0x0a                       | Describe the types (int64, float, etc) for the binary data         |
| Time Section        | 0x40                       | Describe what format the timestamp is using?                       |
| Description Section | 0x80                       | Describe the contents of the file                                  |
| NameValue Section   | 0x81                       | Arbitrary metadata. [Key]: Value pairs is the only style supported |
| Custom              | larger than 0xffff         | You can do whatever you want                                       |


According to the spec, teafile doesn't strictly require metadata sections. Does it makes sense to have zero metadata sections describing the data? If you had zero sections, your file would simply be the above mentioned header, followed by the binary data. You would need to know exactly how you stored the data. That might be the case for some applications that store their data in the exact same format every time the file is saved. 

A section always looks like this:

| Bytes | Description         | What is it for?                                                           |
| ----- | ------------------- | ------------------------------------------------------------------------- |
| 4     | Section Type        | The program reading this file needs to know what type of section follows. |
| 4     | Next Section Offset | The byte offset from the current byte location to the next section        |
| 0 - N | The section's data  | The actual metadata for the section                                       |

The *Next Section Offset* is very useful because it allows an application to jump from section to section - only parsing the metadata it's interested in and skipping anything it doesn't know how to parse (for example - applications that haven't implemented a section type parser).

I won't go into detail about how each section is layed out in memory.

##### Item Section

This is (in my opinion) the most important section type. It allows you to describe the your binary data and how it is layed out in memory.

1. You can specify the field type. They have the following values:
```js
// platform agnostic
    Int8 = 1,
    Int16 = 2,
    Int32 = 3,
    Int64 = 4,

    UInt8 = 5,
    UInt16 = 6,
    UInt32 = 7,
    UInt64 = 8,

    Float = 9, // IEEE 754
    Double = 10, // IEEE 754

    // platform specific
    NetDecimal = 0x200,

    // private extensions must have integer identifiers above 0x1000.
    Custom = 0x1000
```

2. The field's offset within the item.

Let's say you had the following item:

```cpp
struct Tick {
    int64 timestamp; // occupies 8 bytes
    int32 flag; // occupies 4 bytes
    float price; // occupies 8 bytes
    int64 volume; // occupies 8 bytes
}
```
If you were describing the price field, the offset value would be 12.

3. Field Name

String representation for this field. Useful to use as a key in a map.

##### Time Section

Here you specify how the timestamp is specified in the binary data. You can specify the epoch and the number of ticks in a day (precision of your timestamps).

##### Description Section

Just text describing what is in the file.

##### NameValue Section

You can include a bunch of Key: Value pairs to describe your content. This is where you would jam in all your metadata about the files. 

You have to specify the type of the value. One of: Int32, Double, Text, Uuid.

For example, if this was a stock ticker file you might have something like this:

| Name        | Value                                 | Kind  |
| ----------- | ------------------------------------- | ----- |
| Ticker      | IBM                                   | Text  |
| DisplayName | International Business Machines Corp. | Text  |
| Resolution  | Day                                   | Text  |
| Feed        | Interactive Brokers                   | Text  |
| Decimals    | 2                                     | Int32 |


#### item data

This is the bulk of the file. It's binary data. You can read the Item Section in the header to know how to parse the file. Or, if your application already knows exactly how the data is layed out, it can skip that part and just start parsing the data right away.


As you can see, this file format provides freedom to allow for different workflows and access patterns. You might have an application heavily using the NameValue section to store useful info about the data that can be shown in an application. Or, you might have an application that just reads the first 32 bytes to find the offset for the data, seeks straight to that offset, and rips through the tons of .tea files (for example, stock market back testing).
