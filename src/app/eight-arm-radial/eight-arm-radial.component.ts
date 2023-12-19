import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { Observable, take } from 'rxjs';
import { EightArmRadial } from './model/eight-arm-radial.model';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-eight-arm-radial',
  templateUrl: './eight-arm-radial.component.html',
  styleUrls: ['./eight-arm-radial.component.scss'],
})
export class EightArmRadialComponent implements OnInit {
  data: EightArmRadial[] = [];
  userForm!: FormGroup;
  fileUrl: any;
  res: any;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      name: [],
      phones: this.formBuilder.array([this.formBuilder.control(null)]),
    });
  }

  getFile(): void {
    this.getFileFromApi().subscribe((res: any) => {
      this.saveAsBlob(res);
    });
  }

  getFileFromApi(): Observable<HttpResponse<Blob>> {
    return this.httpClient.post<Blob>(
      'http://localhost:3000/test',
      { test: 'test' },
      {
        observe: 'response',
        responseType: 'blob' as 'json',
      }
    );
  }

  private saveAsBlob(data: any) {
    const blob = new Blob([data.body], { type: 'application/vnd.ms-excel' });
    const file = new File([blob], '8arm.xlsx', {
      type: 'application/vnd.ms-excel',
    });
    saveAs(file);
  }

  addPhone(): void {
    (this.userForm.get('phones') as FormArray).push(
      this.formBuilder.control(null)
    );
  }

  removePhone(index: number) {
    (this.userForm.get('phones') as FormArray).removeAt(index);
  }

  getPhonesFormControls(): AbstractControl[] {
    return (<FormArray>this.userForm.get('phones')).controls;
  }

  send(values: any) {
    values?.phones.forEach((element: string) => {
      const array = [0, 0, 0, 0, 0, 0, 0, 0];
      element.split('').forEach((a) => {
        array[Number(a) - 1] = array[Number(a) - 1] + 1;
      });
      const invalid = array.some((el) => !el);
      const mapped = array.map((el) => (!el ? el : el - 1));
      const sumMapped = 0;
      const sumWithInitial = mapped.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        sumMapped
      );
      console.log(array);
      console.log(mapped);
      console.log(sumWithInitial);
      console.log(invalid);
    });
    console.log(values);
  }

  files: any | Blob = [];

  onFileAdd(event: any) {
    // onFileAdd(files: FileList) {
    const file = event.target.files.item(0);
    this.files.push(file);
    console.log(file, this.files);
  }

  onClear() {
    this.files = [];
  }

  onUpload() {
    const formData = new FormData();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    formData.append('file', this.files[0], 'file');
    this.httpClient.post('http://localhost:3000', formData).subscribe((res) => {
      this.res = res;
      console.log(this.res);
    });
  }
}
