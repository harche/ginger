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
  ginger.loadNetworksDetails();
  ginger.loadVolumesDetails();
};

ginger.createMoreList = function(settings) {
  var toolbarNode = null;
  var btnHTML, dropHTML = [];
  var container = settings.panelID;
  var toolbarButtons = settings.buttons;
  var buttonType = settings.type;
  toolbarNode = $('<div class="btn-group"></div>');
  toolbarNode.appendTo($("#" + container));
  dropHTML = ['<div class="dropdown menu-flat">',
    '<button id="action-dropdown-button-', container, '" class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">', (buttonType === 'action') ? '<span class="edit-alt"></span>Actions' : buttonType, '<span class="caret"></span>',
    '</button>',
    '<ul class="dropdown-menu"></ul>',
    '</div>'
  ].join('');
  $(dropHTML).appendTo(toolbarNode);

  $.each(toolbarButtons, function(i, button) {
    var btnHTML = [
      '<li role="presentation"', button.critical === true ? ' class="critical"' : '', '>',
      '<a role="menuitem" tabindex="-1" data-backdrop="static"  data-keyboard="false" data-dismiss="modal"', (button.id ? (' id="' + button.id + '"') : ''), (button.disabled === true ? ' class="disabled"' : ''),
      '>',
      button.class ? ('<i class="' + button.class) + '"></i>' : '',
      button.label,
      '</a></li>'
    ].join('');
    var btnNode = $(btnHTML).appendTo($('.dropdown-menu', toolbarNode));
    button.onClick && btnNode.on('click', button.onClick);
  });
}

ginger.loadMoreActionButtons = function() {
  var moreButton = [{
     id:'sd-search-image-button',
     label: 'Search',
     onClick: function(event) {
     }},
     {
     id:'sd-import-image-button',
     label: 'Import',
     onClick: function(event){}},
     {
     id:'sd-pull-image-button',
     label: 'Pull',
     onClick: function(event){}},
     {
     id:'sd-load-image-button',
     label: 'Load',
     onClick: function(event){}},
     {
     id:'sd-build-image-button',
     label: 'Build',
     onClick: function(event){}}];
  var moreListSettings = {
    panelID: 'more-images-actions',
    buttons: moreButton,
    type: 'More'
  };
  ginger.createMoreList(moreListSettings);
};

ginger.loadImagesActionButtons = function() {
  var actionButton = [{
     id:'sd-tag-image-button',
     label: 'Tag',
     onClick: function(event) {
     }
     },{
     id:'sd-save-image-button',
     label: 'Save',
     onClick: function(event) {
     }},
     {
     id:'sd-push-image-button',
     label: 'Push',
     onClick: function(event){}},
     {
     id:'sd-history-image-button',
     label: 'History',
     onClick: function(event){}}];

  var actionListSettings = {
    panelID: 'file-systems-actions',
    buttons: actionButton,
    type: 'action'
  };
  ginger.createActionList(actionListSettings);
};

// ******************** Container Images ********************

ginger.loadImagesDetails = function() {
  var gridFields = [];
  var opts = [];
  opts['id'] = 'container-images';
  opts['gridId'] = "imagesGrid";

  ginger.loadMoreActionButtons();
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
  ginger.loadImagesActionButtons();
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

ginger.loadMoreInstanceButtons = function() {
  var moreButton = [{
     id:'sd-log-instance-button',
     label: 'Logs',
     onClick: function(event) {}
     },{
     id:'sd-create-instance-button',
     label: 'Create',
     onClick: function(event) {}}];
  var moreListSettings = {
    panelID: 'more-instance-actions',
    buttons: moreButton,
    type: 'More'
  };
  ginger.createMoreList(moreListSettings);
};

ginger.loadInstanceActionButtons = function() {
  var actionButton = [
     {
     id:'sd-commit-instance-button',
     label: 'Commit',
     onClick: function(event) {}
     },
     {
     id:'sd-exec-instance-button',
     label: 'Exec',
     onClick: function(event) {}},
     {
     id:'sd-export-instance-button',
     label: 'Export',
     onClick: function(event) {}},
     {
     id:'sd-stop-instance-button',
     label: 'Stop',
     onClick: function(event) {}},
     {
     id:'sd-pause-instance-button',
     label: 'Pause/Unpause',
     onClick: function(event) {}},
     {
     id:'sd-rename-instance-button',
     label: 'Rename',
     onClick: function(event) {}},
     {
     id:'sd-restart-instance-button',
     label: 'Restart',
     onClick: function(event) {}},
     {
     id:'sd-remove-instance-button',
     label: 'Remove',
     onClick: function(event) {}},
     {
     id:'sd-start-instance-button',
     label: 'Start',
     onClick: function(event) {}
  }];

  var actionListSettings = {
    panelID: 'instance-actions',
    buttons: actionButton,
    type: 'action'
  };
  ginger.createActionList(actionListSettings);
};

// ******************** Container Instances ********************

ginger.loadInstancesDetails = function() {
  var gridFields = [];
  var opts = [];

  opts['id'] = 'container-instances';
  opts['gridId'] = "instancesGrid";

  ginger.loadMoreInstanceButtons();
  ginger.loadInstanceActionButtons();
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


// ******************** Container Networks ********************

ginger.loadNetworksDetails = function() {
  var gridFields = [];
  var opts = [];
  opts['id'] = 'container-networks';
  opts['gridId'] = "networksGrid";

  gridFields = [{
    "column-id": 'Name',
    "type": 'string',
    "width": "15%",
    "title": 'Name',
    "identifier": true
  }, {
    "title": 'Driver',
    "column-id": 'Driver',
    "width": "80%",
    "type": 'string'
  }];
  opts['gridFields'] = JSON.stringify(gridFields);
  ginger.createBootgrid(opts);
  ginger.initNetworksGridData();

  $('#container-networks-refresh-btn').on('click', function(event) {
    ginger.hideBootgridData(opts);
    ginger.showBootgridLoading(opts);
    ginger.initNetworksGridData();
  });

};

ginger.initNetworksGridData = function() {
  var opts = [];
  opts['gridId'] = "networksGrid";
  ginger.getSANAdapters(function(result) {
    ginger.loadBootgridData(opts['gridId'], result);
    ginger.showBootgridData(opts);
    ginger.hideBootgridLoading(opts);
  });
};


// ******************** Container Volumes ********************

ginger.loadVolumesDetails = function() {
  var gridFields = [];
  var opts = [];
  opts['id'] = 'container-volumes';
  opts['gridId'] = "volumesGrid";

  gridFields = [{
    "column-id": 'Name',
    "type": 'string',
    "width": "15%",
    "title": 'Name',
    "identifier": true
  }, {
    "title": 'Driver',
    "column-id": 'Driver',
    "width": "80%",
    "type": 'string'
  }];
  opts['gridFields'] = JSON.stringify(gridFields);
  ginger.createBootgrid(opts);
  ginger.initVolumesGridData();

  $('#container-volumes-refresh-btn').on('click', function(event) {
    ginger.hideBootgridData(opts);
    ginger.showBootgridLoading(opts);
    ginger.initVolumesGridData();
  });
};

ginger.initVolumesGridData = function() {
  var opts = [];
  opts['gridId'] = "volumesGrid";
  ginger.getVolumegroups(function(result) {
    ginger.loadBootgridData(opts['gridId'], result);
    ginger.showBootgridData(opts);
    ginger.hideBootgridLoading(opts);
  });
};
