import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from '../_services/configuration.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.sass']
})
export class ConfigurationComponent implements OnInit {

  public visible = false;

  constructor(
    public configurationService: ConfigurationService
  ) { }

  ngOnInit() {
    this.visible = false;
  }

  // Change visibility of main menu
  toggleVisibility() {
    this.visible = !this.visible;
  }

  reset(item) {
    this.configurationService.initValue(item);
  }

  setValue(item, event) {
    this.configurationService.setValue(item, event.target.value);
  }


}
