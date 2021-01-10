const request = require("superagent");
const colors = require("colors");

const Feature = require("../models/feature");
const AdminUnit = require("../models/adminUnit");

module.exports = {
  getBFScommuneData: function (bfsCommuneName, callback) {
    const swisstopoCommuneQueryTemplate =
      "query=PREFIX+ld%3A+%3Chttp%3A%2F%2Flinkeddata.ru%2F%3E%0APREFIX+dcterms%3A+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%3E%0APREFIX+xsd%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E%0APREFIX+gn%3A+%3Chttp%3A%2F%2Fwww.geonames.org%2Fontology%23%3E%0APREFIX+schema%3A+%3Chttp%3A%2F%2Fschema.org%2F%3E%0APREFIX+dcterm%3A+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%3E%0APREFIX+ldadm%3A+%3Chttps%3A%2F%2Fld.geo.admin.ch%2Fdef%2F%3E%0A%0ASELECT+%3FcommuneUri+%3FcommuneName+%3FcantonUri+%3FcantonName+%3FbfsNum%0AWHERE+%7B%0A++%3FcommuneUri+gn%3AfeatureCode+%3Chttp%3A%2F%2Fwww.geonames.org%2Fontology%23A.ADM3%3E%3B%0A++++schema%3Aname+%22COMMUNEPLACEHOLDER%22%3B%0A++++++++++++++schema%3Aname+%3FcommuneName%3B%0A%09ldadm%3AbfsNumber+%3FbfsNum+%3B%0A++++gn%3AparentADM1+%3FcantonUri+%3B%0A%09%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2Fissued%3E+%3FDate+.%0A+%3FcantonUri+schema%3Aname+%3FcantonName.%0A++FILTER+(%3FDate+%3D+%222020-01-01%22%5E%5Exsd%3Adate)%0A%7D%0ALIMIT+100&contentTypeConstruct=text%2Fturtle&contentTypeSelect=application%2Fsparql-results%2Bjson&endpoint=https%3A%2F%2Fld.geo.admin.ch%2Fquery&requestMethod=POST&tabTitle=Query&headers=%7B%7D&outputFormat=rawResponse";
    const stpQuery = swisstopoCommuneQueryTemplate.replace(
      "COMMUNEPLACEHOLDER",
      bfsCommuneName
    );
    request
      .post("https://ld.geo.admin.ch/query")
      .send(stpQuery)
      .set("Accept", "application/sparql-results+json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .end((err, res) => {
        if (err) {
          callback(err);
        } else if (res.body.results.bindings.length == 1) {
          //console.log(colors.magenta(res.body.results.bindings[0]))
          const adminUnitRes = new AdminUnit({
            uri: res.body.results.bindings[0].communeUri.value,
            bfsNum: res.body.results.bindings[0].bfsNum.value,
            type: "http://www.geonames.org/ontology#A.ADM3",
            name: res.body.results.bindings[0].communeName.value,
            parentUri: res.body.results.bindings[0].cantonUri.value,
            parentName: res.body.results.bindings[0].cantonName.value,
          });
          callback(undefined, adminUnitRes);
        }
      });
  },
  getSwisstopoCommuneFeature: function (communeName, callback) {
    getBFSCommuneData("Ins", console.error());
    request
      .get(
        "http://api3.geo.admin.ch/rest/services/api/MapServer/ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill/2271?geometryFormat=geojson&sr=2056"
      )
      .end((err, res) => {
        if (err) {
          callback(err);
        } else {
          //       console.log(colors.magenta(res.body))
          //      const swisstopoFeature = new Feature({
          // //       id: 1,
          //          uri: res.body.feature.featureId,
          //          description: res.body.feature.properties.label,
          // //       wktGeometry: res.body.results.bindings[0].WKT.value,
          //          projection: "EPSG:2058",
          //        selected: false,
          //     });
          //    callback(undefined, swisstopoFeature);
          callback(undefined, res.body.feature);
          //   }
        }
      });
  },
};