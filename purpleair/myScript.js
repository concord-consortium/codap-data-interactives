import fetch from 'node-fetch';

const state = {
    "latitude": 35.1987522,
    "longitude": -111.6518229,
    "city": "Flagstaff",
    "state": "AZ",
    "zip": 0,
    "bounding_box": [
      35.054027379856116,
      -110.83466544818978,
      35.34347702014389,
      -112.46898035181022
    ],
    "radiusInMiles": 10,
    "startDate": "2022-04-01",
    "endDate": "2022-04-01",
    "averaginMinutes": 60

}

const api_key = "CA299E4B-82DF-11EC-B9BF-42010A800003"
const FIELDS_REQD = 'name,primary_id_a,primary_key_a,latitude,longitude'
const [selat, selng, nwlat, nwlng] = state["bounding_box"]

const BASE_PURPLE_AIR_URL = `https://api.purpleair.com/v1/sensors?api_key=${api_key}&fields=${FIELDS_REQD}&selat=${selat}&selng=${selng}&nwlat=${nwlat}&nwlng=${nwlng}`

const purple_air_fields =   {
    sensor_index: "",
    name: "",
    primary_id_a: "",
    primary_key_a: "",
    latitude: "",
    longitude: ""
  }

async function getPurpleAirData(){

    let caseValues = []

    let fetch_purple_air = await (await fetch(BASE_PURPLE_AIR_URL)).json() 

    // for (let f of fields){
    //     purple_air_fields[f]=""
    // }

    let data = fetch_purple_air.data
    for (let d of data){
        
        let newRow = {...purple_air_fields}
        newRow.sensor_index =   d[0]
        newRow.name =           d[1]
        newRow.primary_id_a =   d[2]
        newRow.primary_key_a =  d[3]
        newRow.latitude =       d[4]
        newRow.longitude =      d[5]

        caseValues.push(newRow)
    }

    return caseValues

}


function getDaysArray (start, end) {
    for(var arr=[],dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
        arr.push((new Date(dt)).toJSON().slice(0,10));
    }
    return arr;
};

async function getThingSpeakData(purpleAirData){
    let answers = []

    for (let sensor of purpleAirData){
        let newRow = {...sensor}

        let dates = getDaysArray( (new Date(state.startDate)), (new Date(state.endDate)) )
        let sensorValues = []
        console.log(sensor.name)
        for (let date of dates){
            const base_url_a = `https://api.thingspeak.com/channels/${sensor.primary_id_a}/feed.json?api_key=${sensor.primary_key_a}&offset=0&average=${state.averaginMinutes}&round=2&start=${date}%2000:00:00&end=${date}%2023:59:59&results=8000`

            let sa = await (await fetch(base_url_a)).json()
            // console.log(sa.feeds)
            let data = sa.feeds
            data.forEach(element => {
                delete element.field1
                delete element.field2
                delete element.field4
                delete element.field5

                element["Temperature"] = element.field6 + " °F"
                element["Humidity"] = element.field7
                element["PM 2.5"] = element.field8
                element["PM 10.0"] = element.field3
                delete element.field3
                delete element.field6
                delete element.field7
                delete element.field8
                Object.assign(element, sensor)
            });
            // sensorValues.push(Object.assign( {}, sensor, ...sa.feeds ))
            answers.push(...data)
            // console.log("******************************")
        }
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")        
    }
    return answers

}


// let purpleAirData = await getPurpleAirData()
// // let purpleAirData = [
// //     {
// //       sensor_index: 322,
// //       name: 'Hemberg Dr',
// //       primary_id_a: 159751,
// //       primary_key_a: 'OU2RMYUOMUGWMTZM',
// //       primary_id_b: 159753,
// //       primary_key_b: 'AKBWR1YB7RK6PFBE',
// //       latitude: 35.224293,
// //       longitude: 35.224293
// //     },
// //     {
// //       sensor_index: 94323,
// //       name: 'Lowell Observatory',
// //       primary_id_a: 1258946,
// //       primary_key_a: 'AO2P3L6UMXDFUHON',
// //       primary_id_b: 1258949,
// //       primary_key_b: '9Y4I4PRU8JRDZPDA',
// //       latitude: 35.203655,
// //       longitude: 35.203655
// //     },
// //     {
// //       sensor_index: 96375,
// //       name: 'NAU',
// //       primary_id_a: 1271617,
// //       primary_key_a: 'J2RIYK6QLKINOYSR',
// //       primary_id_b: 1271619,
// //       primary_key_b: 'L7E2NOPE9RBM076T',
// //       latitude: 35.186287,
// //       longitude: 35.186287
// //     },
// //     {
// //       sensor_index: 97747,
// //       name: 'Lowell Observatory 42" Hall Telescope',
// //       primary_id_a: 1287425,
// //       primary_key_a: 'NXEHJYEWSSJ383TC',
// //       primary_id_b: 1287427,
// //       primary_key_b: 'T5V9HWYJGI27L8SG',
// //       latitude: 35.0968,
// //       longitude: 35.0968
// //     },
// //     {
// //       sensor_index: 101665,
// //       name: 'Andrea Dr, University Heights, Flagstaff',
// //       primary_id_a: 1332955,
// //       primary_key_a: 'NFRAAB5DXXLDCKOI',
// //       primary_id_b: 1332957,
// //       primary_key_b: '02AY6RR4TAISW614',
// //       latitude: 35.1736,
// //       longitude: 35.1736
// //     }]
// // console.log(purpleAirData)

// let thingSpeakData = await getThingSpeakData(purpleAirData)
// console.log(thingSpeakData)



let [lat,lng] = [35.22,-111.61] 
const baseElevationURL = `https://api.opentopodata.org/v1/test-dataset?locations=35.224293,-111.60618|35.203655,-111.665375|35.186287,-111.65844|35.0968,-111.53629|35.1736,-111.67971`
let elevation = (await (await fetch(baseElevationURL)).json()).results
// console.dir(elevation)
elevation.forEach(element => {
    delete element.dataset
    delete element.location
    // console.log(element)    
});
console.log(elevation)



            // const BASE_URL = "https://api.purpleair.com/v1/sensors?api_key=CA299E4B-82DF-11EC-B9BF-42010A800003&"
            // const REQUIRED_FIELDS = "name,primary_id_a,primary_key_a,primary_id_b,primary_key_b,latitude,longitude"
            // // resp sequence ===> sensor index, name, primary id a, key a, primary id b , key b // shown by response.fields

            // const bounds = purple_air.state.bounding_box

            // const lat1 = bounds[0]
            // const long1 = bounds[1]
            // const lat2 = bounds[2]
            // const long2 = bounds[3]

            // // const startTime = (new Date(this.state.startDate)).getTime()/1000
            // // startTime = (startTime.getTime()/1000)
            // // console.log(`start time = ${startTime}`)

            // const bounding_string = `&selat=${lat1}&selng=${long1}&nwlat=${lat2}&nwlng=${long2}`

            // const URL = `${BASE_URL}fields=${REQUIRED_FIELDS}${bounding_string}`

            // let getPAdata = await fetch(URL, requestOptions)
            // if (!getPAdata.ok) {
            //     const message = `An error has occured: ${response.status}`;
            //     console.error(message)
            //     throw new Error(message);
            // } else {


            //     // console.info(purple_air.state)
            //     let result = await getPAdata.json()
            //     console.info("*****purple air fetch*****")

            //     // console.info(result)

            //     let fields = await result.fields
            //     let datas = await result.data

            //     let index_i = 1
            //     for (data of datas) {
            //         purple_air.setSpinnerText(`generating values for sensor ${index_i}`)

            //         let caseValues = {}
            //         // console.log(data)
            //         const sensorIndex = data[0]
            //         const sensorname = data[1]
            //         caseValues["Location"] = `${purple_air.state.city}, ${purple_air.state.state}`
            //         caseValues["Sensor Index"] = sensorIndex
            //         caseValues["Sensor Name"] = sensorname

            //         let [id_a, key_a] = data.slice(2, 4)
            //         let [id_b, key_b] = data.slice(4, 6)

            //         let [sensorLat, sensorLong] = data.slice(6, 8)

            //         caseValues["latitude"] = sensorLat
            //         caseValues["longitude"] = sensorLong

            //         // console.log(id_a, key_a)
            //         // console.log(id_b, key_b)

            //         let base_thingsspeak_url_a = `https://api.thingspeak.com/channels/${id_a}/feed.json?api_key=${key_a}&start=${purple_air.state.startDate}%0000:00:00&end=${purple_air.state.endDate}%0023:59:59&offset=0&round=2&average=${purple_air.state.averaginMinutes}&timezone=America/Phoenix`

            //         let base_thingsspeak_url_b = `https://api.thingspeak.com/channels/${id_b}/feed.json?api_key=${key_b}&start=${purple_air.state.startDate}%0000:00:00&end=${purple_air.state.endDate}%0023:59:59&offset=0&round=2&average=${purple_air.state.averaginMinutes}&timezone=America/Phoenix`

            //         let fetch_a = await (await fetch(base_thingsspeak_url_a)).json()

            //         let channels_a = fetch_a.channels
            //         let feeds_a = fetch_a.feeds

            //         // console.log(fetch_a.feeds)

            //         let fetch_b = await (await fetch(base_thingsspeak_url_b)).json()
            //         // console.log(fetch_b.feeds)

            //         let channels_b = fetch_b.channels
            //         let feeds_b = fetch_b.feeds

            //         for (let i = 0; i < feeds_a.length; i++) {
            //             dfa = feeds_a[i]
            //             dfb = feeds_b[i]

            //             if (flag === 1){
            //                 console.log(base_thingsspeak_url_a, base_thingsspeak_url_b)
            //                 console.log(feeds_a, feeds_b)
            //                 console.log(dfa, dfb)
            //                 flag = 0
            //             }

            //             caseValues["Created at"] = (new Date(dfa.created_at)).toISOString()

            //             caseValues["Humidity A"] = dfa.field7
            //             caseValues["Temperature A"] = dfa.field6
            //             caseValues["PM 2.5 A"] = dfa.field8
            //             caseValues["PM 10.0 A"] = dfa.field3
            //             caseValues["AQI A"] = purple_air.getAQIfromPM(dfa.field3)
                        
            //             pluginHelper.createItems(caseValues)
            //         }
            //         index_i = index_i + 1


            //     }
            //     this.createMapComponent()
            //     this.createCaseTable("dataset")

            // }
