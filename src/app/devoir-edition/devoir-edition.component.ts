import { Component, OnInit, Input } from '@angular/core';

//import * as InlineEditor from '../_helpers/ckeditor/ckeditor.js';
import * as InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { BlurEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';

import { DevoirService } from '../_services/devoir.service';

@Component({
  selector: 'app-devoir-edition',
  templateUrl: './devoir-edition.component.html',
  styleUrls: ['./devoir-edition.component.sass']
})
export class DevoirEditionComponent implements OnInit {

  public editor: any = InlineEditor;
  public itemEdited = null;

  constructor(
    public devoirService: DevoirService
  ) { }

  ngOnInit() {
  }

  trackByItems(index: number, item: any): string {
    return item.id;
  }

  convertToEditor(item: any, event: any) {
    this.itemEdited = item;
  }

  public onBlurEditor({ editor }: BlurEvent) {
    // this.itemEdited = null;
  }

  public onReadyEditor(editor: any) {
    editor.editing.view.focus();
  }

  public toggleItem(item: any) {
    const itemId = item.id;
    if (itemId) {
      item.visible = !item.visible;
    }

  }

}
