/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2018 Photon Storm Ltd.
 * @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
 */

var Class = require('../../utils/Class');
var FileTypesManager = require('../FileTypesManager');
var GetFastValue = require('../../utils/object/GetFastValue');
var ImageFile = require('./ImageFile.js');
var IsPlainObject = require('../../utils/object/IsPlainObject');
var JSONFile = require('./JSONFile.js');
var LinkFile = require('../LinkFile.js');

/**
 * @classdesc
 * An Atlas JSON File.
 *
 * @class AtlasJSONFile
 * @extends Phaser.Loader.LinkFile
 * @memberOf Phaser.Loader.FileTypes
 * @constructor
 * @since 3.0.0
 *
 * @param {string} key - The key of the file within the loader.
 * @param {string} textureURL - The url to load the texture file from.
 * @param {string} atlasURL - The url to load the atlas file from.
 * @param {string} path - The path of the file.
 * @param {XHRSettingsObject} [textureXhrSettings] - Optional texture file specific XHR settings.
 * @param {XHRSettingsObject} [atlasXhrSettings] - Optional atlas file specific XHR settings.
 */
var AtlasJSONFile = new Class({

    Extends: LinkFile,

    initialize:

    function AtlasJSONFile (loader, key, textureURL, atlasURL, textureXhrSettings, atlasXhrSettings)
    {
        if (IsPlainObject(key))
        {
            var config = key;

            key = GetFastValue(config, 'key');
            textureURL = GetFastValue(config, 'textureURL');
            atlasURL = GetFastValue(config, 'atlasURL');
            textureXhrSettings = GetFastValue(config, 'textureXhrSettings');
            atlasXhrSettings = GetFastValue(config, 'atlasXhrSettings');
        }

        var image = new ImageFile(loader, key, textureURL, textureXhrSettings);
        var data = new JSONFile(loader, key, atlasURL, atlasXhrSettings);

        LinkFile.call(this, loader, 'atlasjson', key, [ image, data ]);
    },

    addToCache: function ()
    {
        if (this.isReadyToProcess())
        {
            var fileA = this.files[0];
            var fileB = this.files[1];

            if (fileA.type === 'image')
            {
                this.loader.textureManager.addAtlas(fileA.key, fileA.data, fileB.data);
                fileB.addToCache();
            }
            else
            {
                this.loader.textureManager.addAtlas(fileB.key, fileB.data, fileA.data);
                fileA.addToCache();
            }

            this.complete = true;
        }
    }

});

/**
 * Adds a Texture Atlas file to the current load queue.
 *
 * Note: This method will only be available if the Atlas JSON File type has been built into Phaser.
 *
 * The file is **not** loaded immediately after calling this method.
 * Instead, the file is added to a queue within the Loader, which is processed automatically when the Loader starts.
 *
 * @method Phaser.Loader.LoaderPlugin#atlas
 * @since 3.0.0
 *
 * @param {string} key - The key of the file within the loader.
 * @param {string} textureURL - The url to load the texture file from.
 * @param {string} atlasURL - The url to load the atlas file from.
 * @param {XHRSettingsObject} [textureXhrSettings] - Optional texture file specific XHR settings.
 * @param {XHRSettingsObject} [atlasXhrSettings] - Optional atlas file specific XHR settings.
 *
 * @return {Phaser.Loader.LoaderPlugin} The Loader.
 */
FileTypesManager.register('atlas', function (key, textureURL, atlasURL, textureXhrSettings, atlasXhrSettings)
{
    var linkfile;

    //  Supports an Object file definition in the key argument
    //  Or an array of objects in the key argument
    //  Or a single entry where all arguments have been defined

    if (Array.isArray(key))
    {
        for (var i = 0; i < key.length; i++)
        {
            linkfile = new AtlasJSONFile(this, key[i]);

            this.addFile(linkfile.files);
        }
    }
    else
    {
        linkfile = new AtlasJSONFile(this, key, textureURL, atlasURL, textureXhrSettings, atlasXhrSettings);

        this.addFile(linkfile.files);
    }

    return this;
});

module.exports = AtlasJSONFile;
