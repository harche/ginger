/*
 * Copyright IBM Corp, 2015-2016
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

ginger.initContainers = function() {
  $(".content-area", "#storage-section").css("height", "100%");
  ginger.loadImagesDetails();
  ginger.loadInstancesDetails();
};

// ******************** Container Images ********************

ginger.loadImagesDetails = function() {
  var gridFields = [];
  var opts = [];
  opts['id'] = 'container-images';
  opts['gridId'] = "imagesGrid";

  gridFields = [{
    "column-id": 'Repository',
    "type": 'string',
    "width": "15%",
    "title": 'Name',
    "identifier": true
  }, {
    "title": 'Tags',
    "column-id": 'RepoTags',
    "width": "15%",
    "type": 'string'
  }, {
    "title": 'Created',
    "column-id": "Created",
    "width": "15%",
    "type": 'string'
  }, {
    "title": 'Virtual Size',
    "column-id": "VirtualSize",
    "type": 'string',
    "width": "50%",
  }];
  opts['gridFields'] = JSON.stringify(gridFields);
  ginger.createBootgrid(opts);
  ginger.initImagesGridData();

  $('#container-images-refresh-btn').on('click', function(event) {
    ginger.hideBootgridData(opts);
    ginger.showBootgridLoading(opts);
    ginger.initImagesGridData();
  });

};

ginger.initImagesGridData = function() {
  var opts = [];
  opts['gridId'] = "imagesGrid";
  ginger.getStgdevs(function(result) {
    for (i = 0; i < result.length; i++) {
      // convert size in bytes to readable format
      result[i]['VirtualSize'] = wok.formatMeasurement(parseInt(result[i]['VirtualSize']), {
        fixed: 2
      });
      result[i]['VirtualSize'] = result[i]['VirtualSize'].toString();
      result[i]['Repository'] = result[i]['RepoTags'][0].split(':')[0];
      for (j=0; j<result[i]['RepoTags'].length; j++){
        result[i]['RepoTags'][j] = result[i]['RepoTags'][j].split(':')[1];
      }
      result[i]['RepoTags'] = result[i]['RepoTags'].toString();
    }
    ginger.loadBootgridData(opts['gridId'], result);
    ginger.showBootgridData(opts);
    ginger.hideBootgridLoading(opts);
  });
};

// ******************** Container Instances ********************

ginger.loadInstancesDetails = function() {
  var gridFields = [];
  var opts = [];

  opts['id'] = 'container-instances';
  opts['gridId'] = "instancesGrid";

  gridFields = [{
    "column-id": 'Image',
    "type": 'string',
    "width": "15%",
    "title": 'Image'
  }, {
    "column-id": 'Command',
    "type": 'string',
    "width": "15%",
    "title": 'Command'
  }, {
    "column-id": 'Created',
    "type": 'string',
    "identifier": true,
    "width": "15%",
    "title": 'Created'
  }, {
    "column-id": 'Status',
    "type": 'string',
    "width": "20%",
    "title": 'Status'
  }, {
    "column-id": "Names",
    "type": 'string',
    "title": 'Names',
    "width": "30%",
  }];
  opts['gridFields'] = JSON.stringify(gridFields);

  ginger.createBootgrid(opts);
  ginger.initInstancesGridData();

  $('#container-instances-refresh-btn').on('click', function(event) {
    ginger.hideBootgridData(opts);
    ginger.showBootgridLoading(opts);
    ginger.initInstancesGridData();
  });
};

ginger.initInstancesGridData = function() {
  var opts = [];
  opts['gridId'] = "instancesGrid";
  ginger.getFilesystems(function(result) {
    for (i = 0; i < result.length; i++) {
      // convert list to string
      result[i]['Names'] = result[i]['Names'].toString();
    }
    ginger.loadBootgridData(opts['gridId'], result);
    ginger.showBootgridData(opts);
    ginger.hideBootgridLoading(opts);
  });
};
