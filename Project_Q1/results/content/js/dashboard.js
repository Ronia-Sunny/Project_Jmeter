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

    var data = {"OkPercent": 99.99358796246821, "KoPercent": 0.006412037531793019};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9021030025527776, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9541747572815534, 500, 1500, "http://localhost:1080/cgi-bin/welcome.pl?signOff=1"], "isController": false}, {"data": [0.9564459930313589, 500, 1500, "http://localhost:1080/cgi-bin/nav.pl?page=menu&in=itinerary"], "isController": false}, {"data": [0.9482429335370511, 500, 1500, "http://localhost:1080/cgi-bin/nav.pl?page=menu&in=flights"], "isController": false}, {"data": [0.946319018404908, 500, 1500, "http://localhost:1080/cgi-bin/reservations.pl?page=welcome"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.9502688172043011, 500, 1500, "http://localhost:1080/cgi-bin/login.pl?intro=true"], "isController": false}, {"data": [0.9560588463027487, 500, 1500, "http://localhost:1080/cgi-bin/welcome.pl?page=itinerary"], "isController": false}, {"data": [0.9489329268292683, 500, 1500, "http://localhost:1080/cgi-bin/welcome.pl?page=search"], "isController": false}, {"data": [0.9495501285347043, 500, 1500, "http://localhost:1080/cgi-bin/reservations.pl"], "isController": false}, {"data": [0.9569767441860465, 500, 1500, "http://localhost:1080/cgi-bin/welcome.pl?page=menus"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:1080/WebTours/home.html"], "isController": false}, {"data": [0.9035674470457079, 500, 1500, "http://localhost:1080/cgi-bin/login.pl"], "isController": false}, {"data": [0.9519562715765247, 500, 1500, "http://localhost:1080/cgi-bin/nav.pl?page=menu&in=home"], "isController": false}, {"data": [0.9545101088646968, 500, 1500, "http://localhost:1080/cgi-bin/nav.pl?in=home"], "isController": false}, {"data": [0.9542635658914729, 500, 1500, "http://localhost:1080/cgi-bin/itinerary.pl"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 46787, 3, 0.006412037531793019, 336.68734904994926, 0, 15290, 260.0, 329.0, 350.0, 403.0, 77.97807340642197, 132.43866335549717, 46.26429565547282], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["http://localhost:1080/cgi-bin/welcome.pl?signOff=1", 2575, 1, 0.038834951456310676, 311.58446601941716, 97, 1478, 265.0, 418.4000000000001, 772.3999999999996, 1085.199999999999, 4.361302123911791, 4.363296863885031, 2.474527865227296], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/nav.pl?page=menu&in=itinerary", 2583, 0, 0.0, 311.5307781649245, 94, 1713, 269.0, 411.99999999999955, 755.1999999999989, 1052.0, 4.35282301553063, 7.433047882948999, 2.507974198401437], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/nav.pl?page=menu&in=flights", 2618, 0, 0.0, 320.9621848739506, 76, 1457, 268.0, 541.5999999999995, 808.1499999999992, 1074.2399999999998, 4.383057090239411, 7.4848275573413705, 2.26857447053407], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/reservations.pl?page=welcome", 2608, 1, 0.03834355828220859, 366.4003067484667, 142, 1561, 306.0, 666.0, 915.0, 1196.6399999999994, 4.369284998676482, 19.27856170861158, 2.265713217087121], "isController": false}, {"data": ["Test", 2571, 3, 0.11668611435239207, 5654.423181641382, 3986, 28531, 4614.0, 7534.800000000109, 14344.0, 20121.400000000012, 4.286607477804177, 131.08620648107623, 45.775539850881586], "isController": true}, {"data": ["http://localhost:1080/cgi-bin/login.pl?intro=true", 5208, 1, 0.019201228878648235, 319.89055299538956, 77, 1435, 272.0, 494.3000000000011, 795.1000000000004, 1038.8199999999997, 8.696813840090842, 9.797105132422683, 4.677079463003473], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/welcome.pl?page=itinerary", 2583, 0, 0.0, 309.65814943863813, 94, 1261, 265.0, 405.0, 773.5999999999995, 1066.9599999999991, 4.350491640925275, 3.473577905675345, 2.489636817951378], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/welcome.pl?page=search", 2624, 0, 0.0, 313.4535060975615, 87, 1401, 267.0, 509.5, 771.0, 1000.0, 4.389538044614703, 3.6121826304607847, 2.250495579514374], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/reservations.pl", 7780, 0, 0.0, 361.06928020565505, 122, 1621, 300.0, 508.6000000000022, 951.9499999999998, 1244.1899999999996, 13.051501425935246, 35.62806189450176, 10.348520264531958], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/welcome.pl?page=menus", 2580, 0, 0.0, 302.0515503875961, 42, 1445, 262.5, 408.9000000000001, 711.8999999999996, 971.0, 4.356842268800281, 3.499918454329992, 2.4762521488689098], "isController": false}, {"data": ["http://localhost:1080/WebTours/home.html", 2571, 0, 0.0, 56.693504472967675, 0, 186, 56.0, 64.0, 68.0, 94.2800000000002, 4.366107727891803, 7.072010780155182, 2.3067531515664323], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/login.pl", 2691, 0, 0.0, 766.2047565960613, 56, 15290, 218.0, 730.4000000000005, 4114.600000000002, 14186.719999999983, 4.486689986561605, 4.533766638037828, 3.0714547661910987], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/nav.pl?page=menu&in=home", 5214, 0, 0.0, 313.6787495205213, 42, 1429, 269.0, 455.0, 758.25, 1022.8500000000004, 8.701181017607626, 14.858590358923715, 4.721822750567813], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/nav.pl?in=home", 2572, 0, 0.0, 310.9611197511666, 110, 1381, 267.0, 405.0, 776.6999999999998, 1054.08, 4.360511936308043, 7.469169420596128, 2.3208299478756067], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/itinerary.pl", 2580, 0, 0.0, 321.72325581395233, 87, 1643, 280.0, 420.9000000000001, 762.0, 1056.38, 4.354658218404676, 4.905885305286015, 2.4367374601033975], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 3, 100.0, 0.006412037531793019], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 46787, 3, "500/Internal Server Error", 3, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["http://localhost:1080/cgi-bin/welcome.pl?signOff=1", 2575, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/reservations.pl?page=welcome", 2608, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/login.pl?intro=true", 5208, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
