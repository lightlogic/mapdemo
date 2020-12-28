const express = require("express");
const request = require("superagent");

const Feature = require("../models/feature");

const router = express.Router();

// method POST
// path: /api/features
router.post("", (req, res, next) => {
  // req.body is a new object added to the request by body-parser
  const feature = new Feature({
    //id: req.body.id,
    uri: req.body.uri,
    description: req.body.description,
    wktGeometry: req.body.wktGeometry,
    projection: req.body.projection,
  });
  feature.save().then((createdFeature) => {
    res.status(201).json({
      message: "Feature added sucessfully",
      featureId: createdFeature._id,
    });
  });
});

// method GET
// path: /api/features
router.get("", (req, res, next) => {
  Feature.find().then((documents) => {
    res.status(200).json({
      message: "Features fetched successfully !",
      features: documents,
    });
  });
});

// methode DELETE
// path: /api/features/fi111jej3iojofidj
router.delete("/:id", (req, res, next) => {
  Feature.deleteOne({ _id: req.params.id }).then((result) => {
    console.log(result);
    res.status(200).json({ message: "Post deleted" });
  });
});

router.get("/:query", (req, res, next) => {
  // let myQuery = req.params.query;
  // myQuery =
  //   "query=PREFIX+schema%3A+%3Chttp%3A%2F%2Fschema.org%2F%3E%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23%3E%0APREFIX+gn%3A+%3Chttp%3A%2F%2Fwww.geonames.org%2Fontology%23%3E%0A%0ASELECT+%3FCommune+%3FName+%3FWKT%0AWHERE+%7B%0A%3FCommune+gn%3AfeatureCode+gn%3AA.ADM3+.%0A%3FCommune+schema%3Aname+%22Mont-Vully%22+.%0A%3FCommune+geo%3AdefaultGeometry+%3FGeometry+.%0A%3FGeometry+geo%3AasWKT+%3FWKT+.%0A%3FCommune+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2Fissued%3E+%3FDate+.%0AFILTER+(%3FDate+%3D+%222020-01-01%22%5E%5Exsd%3Adate)%0A%7D";
  request
    .post("https://ld.geo.admin.ch/query")
    .send(req.params.query)
    .set("Accept", "application/sparql-results+json")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .then((response) => {
      console.log(response.body)
      res.status(200).json(response.body.results);
    });
});

module.exports = router;