import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { Observable, take } from 'rxjs';

@Component({
  selector: 'app-eight-arm-radial',
  templateUrl: './eight-arm-radial.component.html',
  styleUrls: ['./eight-arm-radial.component.scss'],
})
export class EightArmRadialComponent implements OnInit {
  userForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      name: [],
      phones: this.formBuilder.array([this.formBuilder.control(null)]),
    });
    this.getFileFromApi().pipe(take(1)).subscribe();
  }

  getFileFromApi(): Observable<HttpResponse<Blob>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.httpClient.get<Blob>('http://localhost:3000', {
      observe: 'response',
      responseType: 'blob' as 'json',
    });
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

  onFileAdd(files: FileList) {
    const file = files.item(0);
    this.files.push(file);
    console.log(file, this.files);
  }

  onClear() {
    this.files = [];
  }

  onUpload() {
    console.log(this.files);
    const formData = new FormData();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    formData.append('file', this.files[0], 'file');
    this.httpClient.post('http://localhost:3000', formData).subscribe();
    // console.log(formData)
  }
}
