/**
 *
 *    Copyright (c) 2020 Silicon Labs
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

const dbApi = require('./db-api.js')
const queryConfig = require('./query-config.js')

function queryEndpointTypes(db, sessionId) {
  return queryConfig.getAllEndpointTypes(db, sessionId)
}

function queryEndpointClusters(db, endpointTypeId) {
  return dbApi
    .dbAll(
      db,
      `
SELECT
  C.CLUSTER_ID,   
  EC.ENDPOINT_TYPE_CLUSTER_ID,
  EC.ENDPOINT_TYPE_REF,
  C.CODE,
  C.NAME,
  EC.SIDE
FROM
  CLUSTER AS C
LEFT JOIN
  ENDPOINT_TYPE_CLUSTER AS EC
ON
  C.CLUSTER_ID = EC.CLUSTER_REF
WHERE 
  EC.ENABLED = 1
  AND EC.ENDPOINT_TYPE_REF = ?
ORDER BY C.CODE
`,
      [endpointTypeId]
    )
    .then((rows) =>
      rows.map((row) => {
        return {
          clusterId: row['CLUSTER_ID'],
          endpointTypeId: row['ENDPOINT_TYPE_REF'],
          endpointTypeClusterId: row['ENDPOINT_TYPE_CLUSTER_ID'],
          code: row['CODE'],
          name: row['NAME'],
          side: row['SIDE'],
        }
      })
    )
}

function queryEndpointClusterAttributes(db, clusterId, endpointTypeId) {
  return dbApi
    .dbAll(
      db,
      `
SELECT
  A.CODE,
  A.NAME,
  A.SIDE,
  EA.STORAGE_OPTION,
  EA.SINGLETON,
  EA.BOUNDED,
  EA.DEFAULT_VALUE,
  EA.INCLUDED_REPORTABLE,
  EA.MIN_INTERVAL,
  EA.MAX_INTERVAL,
  EA.REPORTABLE_CHANGE
FROM
  ATTRIBUTE AS A
LEFT JOIN
  ENDPOINT_TYPE_ATTRIBUTE AS EA
ON
  A.ATTRIBUTE_ID = EA.ATTRIBUTE_REF
WHERE
  A.CLUSTER_REF = ?
  AND EA.ENDPOINT_TYPE_REF = ?
    `,
      [clusterId, endpointTypeId]
    )
    .then((rows) =>
      rows.map((row) => {
        return {
          clusterId: clusterId,
          attributeCode: row['CODE'],
          name: row['NAME'],
          side: row['SIDE'],
          storage: row['STORAGE_OPTION'],
          isSingleton: row['SINGLETON'],
          isBound: row['BOUNDED'],
          defaultValue: row['DEFAULT_VALUE'],
          includedReportable: row['INCLUDED_REPORTABLE'],
          minInterval: row['MIN_INTERVAL'],
          maxInterval: row['MAX_INTERVAL'],
          reportableChange: row['REPORTABLE_CHANGE'],
        }
      })
    )
}

exports.queryEndpointClusters = queryEndpointClusters
exports.queryEndpointTypes = queryEndpointTypes
exports.queryEndpointClusterAttributes = queryEndpointClusterAttributes
