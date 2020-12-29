import { stringify } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Feature } from '../feature.model';

import { FeaturesService } from '../features.service';

@Component({
  selector: 'app-feature-create',
  templateUrl: './feature-create.component.html',
  styleUrls: ['./feature-create.component.css'],
})
export class FeatureCreateComponent implements OnInit {
  communeForm: FormGroup;
  featureForm: FormGroup;
  isCommuneLoading = false;
  private featureId: string;
  private queryTemplate =
    'query=PREFIX+schema%3A+%3Chttp%3A%2F%2Fschema.org%2F%3E%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23%3E%0APREFIX+gn%3A+%3Chttp%3A%2F%2Fwww.geonames.org%2Fontology%23%3E%0A%0ASELECT+%3FCommune+%3FName+%3FWKT%0AWHERE+%7B%0A%3FCommune+gn%3AfeatureCode+gn%3AA.ADM3+.%0A%3FCommune+schema%3Aname+%22COMMUNEPLACEHOLDER%22+.%0A%3FCommune+geo%3AdefaultGeometry+%3FGeometry+.%0A%3FGeometry+geo%3AasWKT+%3FWKT+.%0A%3FCommune+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2Fissued%3E+%3FDate+.%0AFILTER+(%3FDate+%3D+%222020-01-01%22%5E%5Exsd%3Adate)%0A%7D';
  private sparqlQuery;
  private featureData: Feature;
  private swisstopoFeatureSub: Subscription;

  constructor(
    public featuresService: FeaturesService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.featureId = null;
    // Commune Form
    this.communeForm = new FormGroup({
      communeName: new FormControl(null),
    });
    // Feature Form
    this.featureForm = new FormGroup({
      uri: new FormControl(null),
      description: new FormControl(null),
      wktGeometry: new FormControl(null),
      projection: new FormControl('EPSG:3857'),
    });
  }

  onAddFeature() {
    this.featuresService.addCustomFeature(
      this.featureId,
      this.featureForm.value.uri,
      this.featureForm.value.description,
      this.featureForm.value.wktGeometry,
      this.featureForm.value.projection
    );
    this.featureForm.reset;
  }

  onAddCommune() {
    this.isCommuneLoading = true;
    this.sparqlQuery = this.queryTemplate.replace(
      'COMMUNEPLACEHOLDER',
      this.communeForm.value.communeName
    );
    this.featuresService.addSwisstopoFeature(this.sparqlQuery);
    this.swisstopoFeatureSub = this.featuresService
      .getSwisstopoFeatureListener()
      .subscribe((subsFeature: Feature) => {
        this.featureData = subsFeature;
        this.featureData.description = this.communeForm.value.communeName
        console.log(this.featureData);
        this.communeForm.reset;
        this.isCommuneLoading = false;
      });
  }
}
