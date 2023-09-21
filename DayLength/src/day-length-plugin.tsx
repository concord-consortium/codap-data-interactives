// ==========================================================================
//
//  Author:   wfinzer
//
//  Copyright (c) 2021 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================

import React, {useRef, Component, ErrorInfo} from 'react';
import {initializePlugin} from './lib/codap-helper';
import './day-length-plugin.css';
import {getSunrise, getSunset} from 'sunrise-sunset-js';
import codapInterface from "./lib/CodapInterface";
import {GeonameSearch} from "./geonameSearch";

const parameters = {
	name: 'Day Length',
	version: '1.00',
	initialDimensions: {
		width: 280,
		height: 385
	}
}

const datasetParameters = {
	contextName: 'Sunrise and Sunset by Location',
	parentCollectionName: 'Locations',
	childCollectionName: 'Days'
}

class DayLengthPlugin extends Component<{},
	{
		loc: string,
		lat: number | string | undefined
		long: number | string | undefined
		hasError: boolean,
	}> {
	[key: string]: any

	ref: any

	// ref: React.RefObject<Element> | null = null

	constructor(props: any) {
		super(props);
		this.state = {
			loc: '',
			lat: undefined,
			long: undefined,
			hasError: false
		}
		this.ref = React.createRef();
		this.getData = this.getData.bind(this)
		this.handleLocation = this.handleLocation.bind(this)
	}

	async componentDidMount() {
		await initializePlugin(parameters.name, parameters.version, parameters.initialDimensions);
		// @ts-ignore
		if (this.ref)
			new GeonameSearch(this.ref.current, 'codap', this.handleLocation)
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// You can also log the error to an error reporting service
		console.log(error, errorInfo);
	}

	handleLocation(location: { latitude: number, longitude: number, name: string }) {
		this.setState({lat: location.latitude, long: location.longitude, loc: location.name})
	}

	async getData() {

		async function datasetExists(iDatasetName: string): Promise<boolean> {
			const tContextListResult: any = await codapInterface.sendRequest({
				"action": "get",
				"resource": "dataContextList"
			}).catch((reason) => {
				console.log('unable to get datacontext list because ' + reason);
			});
			return tContextListResult.values.some((aContext: any) => aContext.name === iDatasetName)
		}

		async function guaranteeDataset(iDatasetParams: any) {
			if (!await datasetExists(iDatasetParams.contextName)) {
				await codapInterface.sendRequest({
					action: 'create',
					resource: 'dataContext',
					values: {
						name: iDatasetParams.contextName,
						title: iDatasetParams.contextName,
						collections: [{
							name: iDatasetParams.parentCollectionName,
							title: iDatasetParams.parentCollectionName,
							attrs: [
								{name: 'location'},
								{name: 'latitude', type: 'categorical', precision: 2},
								{name: 'longitude', type: 'categorical', precision: 2}
							]
						},
							{
								name: iDatasetParams.childCollectionName,
								title: iDatasetParams.childCollectionName,
								parent: iDatasetParams.parentCollectionName,
								attrs: [
									{name: 'day', type: 'date', precision: 'day'},
									{name: 'day length', type: 'numeric', unit: 'hours', precision: 3},
									{
										name: 'sunrise',
										type: 'date',
										precision: 'minute',
										hidden: true,
										description: 'Note that time is for the timezone of your browser'
									},
									{
										name: 'sunset',
										type: 'date',
										precision: 'minute',
										hidden: true,
										description: 'Note that time is for the timezone of your browser'
									},
									{
										name: 'rise hour',
										unit: 'decimal hours',
										description: 'Note that time is for the timezone of your browser'
									},
									{
										name: 'set hour',
										unit: 'decimal hours',
										description: 'Note that time is for the timezone of your browser'
									},
									// {name: 'state'}
								]
							}]
					}
				})
			}
		}

		async function getComponentByTypeAndTitleOrName(iType: string, iTitle: string, iName?: string): Promise<number> {
			const tListResult: any = await codapInterface.sendRequest(
				{
					action: 'get',
					resource: `componentList`
				}
			)
				.catch(() => {
					console.log('Error getting component list')
				});
			let tID = -1;
			if (tListResult.success) {
				let tFoundValue = tListResult.values.find((iValue: any) => {
					return iValue.type === iType && (iValue.title === iTitle || iValue.name === iName);
				});
				if (tFoundValue)
					tID = tFoundValue.id;
			}
			return tID;
		}

		/**
		 * Find the case table or case card corresponding to the given dataset
		 * @param iDatasetInfo
		 */
		async function guaranteeTableOrCardIsVisibleFor(iName: string) {
			if (iName !== '') {
				const tTableID = await getComponentByTypeAndTitleOrName('caseTable', iName),
					tFoundTable = tTableID >= 0
				if (!tFoundTable) {
					const tResult: any = await codapInterface.sendRequest({
						action: 'create',
						resource: `component`,
						values: {
							type: 'caseTable',
							name: iName,
							title: iName,
							dimensions: {width: 572, height: 200},
							dataContext: iName
						}
					}).catch((reason) => {
						console.log(JSON.stringify(reason))
					})
				}
			}
		}

		async function removeFormulas(iDatasetParams: any) {
			const tMsgs = ['day length', 'rise hour', 'set hour', /*'state'*/].map(name => {
				return {
					"action": "update",
					"resource": `dataContext[${iDatasetParams.contextName}].collection[${iDatasetParams.childCollectionName}].attribute[${name}]`,
					values: {
						formula: ''
					}
				}
			})
			await codapInterface.sendRequest(tMsgs)
		}

		async function addFormulas(iDatasetParams: any) {
			const tMsgs = [
				{name: 'day length', formula: `(sunset-sunrise)/3600 > 0 ? (sunset-sunrise)/3600 : (sunset-sunrise)/3600 + 24`},
				{name: 'rise hour', formula: 'hours(sunrise)+minutes(sunrise)/60'},
				{name: 'set hour', formula: 'hours(sunset)+minutes(sunset)/60'},
				{name: 'state', formula: ''},
				/*				{name: 'state', formula: `isMissing(sunrise) ?
				caseIndex=1 ? (latitude>0 ? 'dark' : 'light') :
				isMissing(prev(sunrise)) ? prev(state) :
				prev(\`rise hour\`) < 6 ? 'light' :
				prev(\`rise hour\`) > 6 ? 'dark' :
				prev(state) : 'normal'`}*/].map(item => {
				return {
					"action": "update",
					"resource": `dataContext[${iDatasetParams.contextName}].collection[${iDatasetParams.childCollectionName}].attribute[${item.name}]`,
					values: {
						formula: item.formula
					}
				}
			})
			await codapInterface.sendRequest(tMsgs)
		}

		const this_ = this,
			createRequests: {}[] = [],
			year = new Date().getFullYear()
		let parentCaseID: number = 0

		function getSolarEventsForYear() {
			const kDestinationTimezoneOffset = Math.round(Number(this_.state.long) / 15) * 60,	// 15° per hour. Result is in minutes
				jan1 = new Date(year, 0, 1),
				kLocalTimezoneOffset = jan1.getTimezoneOffset(),	// This is in minutes
				kMSToAdd = (kDestinationTimezoneOffset + kLocalTimezoneOffset) * 60000,
				start = jan1.getTime();
			console.log('kHoursToAdd =', kMSToAdd);
			for (let i = 0; i < 366; i++) {
				const d = new Date(start + (i * 24 * 60 * 60 * 1000));
				if (d.getFullYear() > year) break; // For non-leap year
				let tSunrise: Date | string = getSunrise(Number(this_.state.lat), Number(this_.state.long), d),
					tSunset: Date | string = getSunset(Number(this_.state.lat), Number(this_.state.long), d)
				if (String(tSunrise) === 'Invalid Date' || String(tSunset) === 'Invalid Date') {
					tSunset = ''
					tSunrise = ''
				} else {
					tSunset = new Date(tSunset.valueOf() + kMSToAdd)
					tSunrise = new Date(tSunrise.valueOf() + kMSToAdd)
				}
				createRequests.push({
					// @ts-ignore
					parent: parentCaseID,
					values: {
						day: d,
						sunrise: tSunrise,
						sunset: tSunset
					}
				});
			}
		}

		if (this.state.lat !== 999 && this.state.long !== 999) {
			await guaranteeDataset(datasetParameters)
			await guaranteeTableOrCardIsVisibleFor(datasetParameters.contextName)
			await addFormulas(datasetParameters)
			const parentCaseResult: any = await codapInterface.sendRequest({
				action: 'create',
				resource: `dataContext[${datasetParameters.contextName}].collection[${datasetParameters.parentCollectionName}].case`,
				values: {
					values: {
						location: this.state.loc,
						latitude: this.state.lat,
						longitude: this.state.long
					}
				}
			})
			parentCaseID = parentCaseResult.values[0].id
			getSolarEventsForYear()
			await codapInterface.sendRequest({
				action: 'create',
				resource: `dataContext[${datasetParameters.contextName}].collection[${datasetParameters.childCollectionName}].case`,
				values: createRequests
			})
			// await addFormulas(datasetParameters)
		}
	}

	public render() {
		if (this.state.hasError) {
			return <h1>Something went wrong!</h1>
		}
		return (
			<div className="DayLengthPlugin">
				<h2>How Long Is a Day?</h2>
				<p>Enter a location by typing the name of a city or town and choosing from the list.
					Or type in a latitude and longitude directly. Press Get Data.
					The resulting dataset shows a full year’s worth of day length, rise hour and set hour.</p>
				<div className='input'>
					<label>
						Location: <div id="geonameContainer" ref={this.ref}></div>
					</label>
					<label>
						Latitude:
						<input type='text' value={this.state.lat}
									 onChange={(e) => this.setState({lat: e.target.value})}
									 onBlur={(e) => this.setState({lat: Number(e.target.value)})}
						/>
					</label>
					<br/>
					<label>
						Longitude:
						<input type='text' value={this.state.long}
									 onChange={(e) => this.setState({long: Number(e.target.value)})}
									 onBlur={(e) => this.setState({long: Number(e.target.value)})}
						/>
					</label>
					<br/>
					<button onClick={this.getData}>
						Get Data
					</button>
				</div>
			</div>
		);
	}

}

export default DayLengthPlugin;
