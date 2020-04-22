/*
==========================================================================

 * Created by tim on 8/22/19.
 
 
 ==========================================================================
noaaStations in noaa-cdo

Author:   Tim Erickson

Copyright (c) 2018 by The Concord Consortium, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==========================================================================

*/

/*
Find station IDs:
https://www.ncdc.noaa.gov/cdo-web/search
*/
function findStation (id) {
  return stations.find(function (sta) {return id === sta.id; });
}

export {findStation};
