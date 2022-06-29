import * as React from 'react'
import {Form, Button, Image, InputOnChangeData} from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, createContact, getContactById } from '../api/todos-api'
import {CreateContactRequest} from "../types/CreateContactRequest";
import {ChangeEvent} from "react";
import {Contact} from "../types/Contact";
import Axios from "axios";

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface AddContactProps {
  match: {
    params: {
      contactId: string
    }
  }
  auth: Auth
}

interface AddContactState {
  name: string
  phone: string
  file: any
  uploadState: UploadState
}

export class AddContact extends React.PureComponent<
  AddContactProps,
  AddContactState
  > {
  state: AddContactState = {
    name: '',
    phone: '',
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  private fileInputReference = React.createRef<any>()


  private handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }
  private handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if(!this.state.name) {
        alert('Name can not be empty')
        return
      }

      await this.storeContactData()

      if (this.state.file) {
        await this.uploadPicture()
        alert('File was uploaded!')
      }

      alert('Contact was created!')
    } catch (e: any) {
      alert('Could not upload file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  private uploadPicture = async () => {
    this.setUploadState(UploadState.FetchingPresignedUrl)
    const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.contactId)

    this.setUploadState(UploadState.UploadingFile)
    await uploadFile(uploadUrl, this.state.file)
  }

  private storeContactData = async () => {
    if(!this.state.name) {
      return
    }

    const newContact: CreateContactRequest = {
      name: this.state.name,
      phone: this.state.phone
    }

    await createContact(this.props.auth.getIdToken(), newContact)
  }

  private setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  private setNameState = (event: ChangeEvent<HTMLInputElement>, { value }: InputOnChangeData) => {
    this.setState({
      name: value
    })
  }

  private setPhoneState = (event: ChangeEvent<HTMLInputElement>, { value }: InputOnChangeData) => {
    this.setState({
      phone: value
    })
  }

  render() {
    if(this.props.match.params.contactId) {
      return this.renderEditPage(this.props.match.params.contactId)
    }

    return (
      <div>
        <h1>Add new contact</h1>
        <Form unstackable onSubmit={this.handleSubmit}>
          <Form.Group unstackable widths={2}>
            <Form.Input
              id='form-input-name'
              label='Name'
              placeholder="Contact's name"
              onChange={this.setNameState}
            />
            <Form.Input
              id='form-input-phone'
              label='Phone'
              placeholder="Contact's phone number"
              onChange={this.setPhoneState}
            />
          </Form.Group>
            <Form.Field>
              <label>Picture</label>
              <input
                ref={this.fileInputReference}
                type="file"
                accept="image/*"
                placeholder="Image to upload"
                onChange={this.handleFileChange}
                hidden
              />
              <Button
                type="button"
                content='Choose picture'
                icon='file'
                onClick={() => this.fileInputReference.current.click()}
              />
              {this.renderUploadedPicture()}
            </Form.Field>

            {this.renderButton()}
        </Form>
      </div>
    )
  }

  private async renderEditPage(contactId: string) {
    const {name, phone, pictureUrl} = await this.loadContact(contactId)
    this.setState({
      name: name,
      phone: phone
    })

    let pictureFile = undefined
    if(pictureUrl) {
      pictureFile = Axios.get(pictureUrl, {responseType:'blob'})
    }
    this.setState({
      file: pictureFile
    })

    return (
      <div>
        <h1>Edit contact</h1>
        <Form unstackable onSubmit={this.handleSubmit}>
          <Form.Group unstackable widths={2}>
            <Form.Input
              id='form-input-name'
              label='Name'
              placeholder="Contact's name"
              onChange={this.setNameState}
              value={this.state.name}
            />
            <Form.Input
              id='form-input-phone'
              label='Phone'
              placeholder="Contact's phone number"
              onChange={this.setPhoneState}
              value={this.state.phone}
            />
          </Form.Group>
          <Form.Field>
            <label>Picture</label>
            <input
              ref={this.fileInputReference}
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
              hidden
            />
            <Button
              type="button"
              content='Choose picture'
              icon='file'
              onClick={() => this.fileInputReference.current.click()}
            />
            {this.renderUploadedPicture()}
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  private renderUploadedPicture() {
    if(this.state.file) {
      return (
        <Image size='small' src={URL.createObjectURL(this.state.file)}/>
      )
    }

    return (
      <span>No image selected</span>
    )
  }

  private renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Save
        </Button>
      </div>
    )
  }

  private async loadContact(contactId: string): Promise<Contact> {
    return await getContactById(this.props.auth.getIdToken(), contactId);
  }
}
