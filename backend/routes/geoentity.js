const express = require("express");
const router = express.Router();
const bodyparser = require("body-parser");
const colors = require("colors");

const GeoEntity = require("../models/geoEntity");

const geoEntityUtils = require("../utils/geoEntity/geoEntityUtils");

router.use(bodyparser.json());

// post new commune based on name
// method POST
// path: /api/geoentity/swisstopo
router.post("/swisstopo/adminunit", (req, res, next) => {
  //TODO move constant to env file
  const geoEntityType_Commune = "commune";
  const COMMUNE_TYPE_URI = "http://www.geonames.org/ontology#A.ADM3";
  const COMMUNE_DOMAIN_LABEL = "bfsNum";
  const layerBodID_communes =
    "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill";
  const layerName_communes = "Gemeindegrenzen";
  GeoEntity.findOne({ name: req.body.commName }, (error, auData) => {
    if (auData == undefined) {
      // commune not yet cached
      // == > get commune metadata from SPARQLendpoint ld.geo.admin.ch and api3.geo.admin for geoJSON
      geoEntityUtils.createGeoEntity(
        req.body.commName,
        geoEntityType_Commune,
        COMMUNE_TYPE_URI,
        COMMUNE_DOMAIN_LABEL,
        (cerror, communeEntity) => {
          if (cerror) {
            console.log(colors.red(cerror));
          } else {
            geoEntityUtils.fetchGeoJson(
              communeEntity,
              layerBodID_communes,
              (gerror, geoJsonData) => {
                if (gerror) {
                  console.log(colors.red(gerror));
                } else {
                  communeEntity.geoJSON = geoJsonData.geoJSON;
                  communeEntity.save().then((createdEntity) => {
                    res.status(201).json({
                      message: "Commune retrieved and cached.",
                      feature: createdEntity,
                    });
                  });
                }
              }
            );
          }
        }
      );
      // auData is defined => the metadata of this commune is allready cached in MongoDB
    } else {
      res.status(200).json({
        message:
          "Commune allready existed. No further data needed to be retrieved.",
        feature: null,
      });
    }
  });
});

// post new river based on name
// method POST
// path: /api/geoentity/swisstopo/river
router.post("/swisstopo/river", (req, res, next) => {
  //TODO move constant to env file
  const geoEntityType_river = "river";
  RIVER_isA_URI = "https://www.wikidata.org/wiki/Q4022";
  const domainIdLabel = "gewissNum";
  const layerBodId_rivers = "ch.bafu.vec25-gewaessernetz_2000";
  GeoEntity.findOne({ name: req.body.rivName }, (error, riverData) => {
    if (riverData == undefined) {
      // river not yet cached in DB
      // == > query wikidata for river unique id ans api3.geo.admin.ch for geoJSON
      geoEntityUtils.createGeoEntity(
        req.body.rivName,
        geoEntityType_river,
        RIVER_isA_URI,
        domainIdLabel,
        (cerror, riverEntity) => {
          if (cerror) {
            console.log(colors.red(cerror));
          } else {
            geoEntityUtils.fetchGeoJson(
              riverEntity,
              layerBodId_rivers,
              (gerror, geoJsonData) => {
                if (gerror) {
                  console.log(colors.red(gerror));
                } else {
                  riverEntity.geoJSON = geoJsonData.geoJSON.results;
                  riverEntity.save().then((createdEntity) => {
                    res.status(201).json({
                      message: "River retrieved and cached.",
                      feature: createdEntity,
                    });
                  });
                }
              }
            );
          }
        }
      );
      //riverData is defined => the metadata of this commune is allready cached in MongoDB
    } else {
      res.status(200).json({
        message:
          "Feature allready existed. No further data needed to be retrieved.",
        feature: null,
      });
    }
  });
});

// method GET one geoEntity
// path: /api/geoentity
// full objects with metadata AND geometry (geoJSON)
router.get("", (req, res, next) => {
  //TODO fix code to get geoEntity
  GeoEntity.find().then((documents) => {
    res.status(200).json({
      message: "Features fetched successfully !",
      features: documents,
    });
  });
});

// method GET one geoEntity
// path: /api/geoentity/metadata
// only retrieve metadata (no geometry)
router.get("/metadata", (req, res, next) => {
  //TODO fix code to get geoEntity
  GeoEntity.find().then((documents) => {
    res.status(200).json({
      message: "Features fetched successfully !",
      features: documents,
    });
  });
});

// method GET one geoEntity
// path: /api/geoentity/geojson
// only retrieve geometry (geoJSON)
router.get("/geojson", (req, res, next) => {
  //TODO fix code to get geoEntity
  GeoEntity.find().then((documents) => {
    res.status(200).json({
      message: "Features fetched successfully !",
      features: documents,
    });
  });
});

// methode PATCH
// path: /api/geoentity/select/fi111jej3iojofidj
router.patch("/select/:id", (req, res, next) => {
  //TODO fix code to update geoEntity
  GeoEntity.updateOne(
    { _id: req.params.id },
    { selected: req.body.selected }
  ).then((result) => {
    res.status(200).json({ message: "Feature selected" });
  });
});


// methode DELETE
// path: /api/geoentity/fi111jej3iojofidj
router.delete("/:id", (req, res, next) => {
  //TODO fix code to delete geoEntity
  GeoEntity.deleteOne({ _id: req.params.id }).then((result) => {
    res.status(200).json({ message: "Feature deleted" });
  });
});

module.exports = router;