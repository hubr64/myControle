import { Component, OnInit, Input, DoCheck } from '@angular/core';

// import * as InlineEditor from '@ckeditor/ckeditor5-build-inline';
import * as InlineEditor from '../_helpers/ckeditor-mycontrole/build/ckeditor.js';
import { BlurEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';

import { DevoirService } from '../_services/devoir.service';

@Component({
  selector: 'app-devoir-edition',
  templateUrl: './devoir-edition.component.html',
  styleUrls: ['./devoir-edition.component.sass']
})
export class DevoirEditionComponent implements DoCheck, OnInit {

  public editor = InlineEditor;
  public itemEdited = null;

  constructor(
    public devoirService: DevoirService
  ) { }

  ngOnInit() {
  }

  ngDoCheck() {
    this.devoirService.doCheck();
  }

  trackByItems(index: number, item: any): string {
    return item.id;
  }

  convertToEditor(item, event) {
    this.itemEdited = item;
  }

  public onBlurEditor({ editor }: BlurEvent) {
    this.itemEdited = null;
  }

  public onReadyEditor(editor) {
    editor.editing.view.focus();
  }

}
