/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.99766773937625, "KoPercent": 0.0023322606237403025};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9999660584417607, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9999660584417607, 500, 1500, "JDBC Request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7674957, 179, 0.0023322606237403025, 1.1151749775274697, 0, 161865, 0.0, 1.0, 1.0, 2.0, 12791.65895829479, 874.4298116021831, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["JDBC Request", 7674957, 179, 0.0023322606237403025, 1.1151749775274697, 0, 161865, 0.0, 1.0, 1.0, 2.0, 12791.65895829479, 874.4298116021831, 0.0], "isController": false}, {"data": ["Transaction Controller", 0, 0, NaN, NaN, 9223372036854775807, -9223372036854775808, NaN, NaN, NaN, NaN, 0.0, 0.0, 0.0], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 24,500 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 24,972 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 24,325 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 13,098 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 24,332 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,785 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,792 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,118 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, 1.1173184357541899, 2.605877791888606E-5], "isController": false}, {"data": ["The operation lasted too long: It took 23,713 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 22,860 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,911 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,445 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,238 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,757 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,594 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,245 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 50,920 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,807 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 84,566 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 161,865 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 19,325 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 15,963 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,807 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 91,048 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,243 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,579 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 24,833 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,765 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 61,546 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 57,437 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 25,102 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,526 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,328 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 59,733 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,193 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,793 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,233 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,552 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,080 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,123 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,128 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,307 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,714 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,361 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,284 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,215 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,521 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 23,930 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,065 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,306 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,270 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 155,303 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 11,814 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,427 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,142 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,270 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,584 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 142,522 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,825 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,256 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,570 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 41,609 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 24,773 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,519 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,369 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,273 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,567 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, 1.1173184357541899, 2.605877791888606E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,894 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,013 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 44,597 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 25,048 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,730 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,114 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,258 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,925 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,235 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 100,724 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,141 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 31,682 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,988 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,174 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,473 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,466 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,271 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 136,159 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,703 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,701 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,510 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,286 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,767 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 155,168 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,915 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,970 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 22,872 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,303 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,839 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 24,681 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 64,718 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,890 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 28,500 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,274 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 24,939 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,606 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 22,781 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,327 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 21,880 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 87,840 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 23,900 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,312 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 22,784 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, 1.1173184357541899, 2.605877791888606E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,070 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,857 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 22,795 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,575 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,276 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 126,594 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,815 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,356 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,500 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,097 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,694 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 24,956 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 34,879 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,391 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 120,519 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,232 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 25,009 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,903 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,190 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 24,273 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 97,412 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,298 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 22,794 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,545 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 84,575 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 145,813 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 38,040 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,022 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,944 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,234 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 97,403 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 23,981 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 107,228 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,052 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 15,920 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,130 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 23,755 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,326 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,329 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,237 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,263 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,607 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,032 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,269 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,071 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 24,913 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,199 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,603 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,452 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 97,453 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,865 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,762 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,438 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 24,952 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,175 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,678 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,920 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 18,770 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,227 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,250 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,659 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,336 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,386 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 22,765 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 77,594 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}, {"data": ["The operation lasted too long: It took 103,874 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.5586592178770949, 1.302938895944303E-5], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7674957, 179, "The operation lasted too long: It took 12,118 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, "The operation lasted too long: It took 10,567 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, "The operation lasted too long: It took 22,784 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, "The operation lasted too long: It took 24,500 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 24,972 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["JDBC Request", 7674957, 179, "The operation lasted too long: It took 12,118 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, "The operation lasted too long: It took 10,567 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, "The operation lasted too long: It took 22,784 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, "The operation lasted too long: It took 24,500 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 24,972 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
