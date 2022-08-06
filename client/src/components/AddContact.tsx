import * as React from 'react'
import {Form, Button, Image, InputOnChangeData} from 'semantic-ui-react'
import Auth from '../auth/Auth'
import {getUploadUrl, uploadFile, createContact} from '../api/contacts-api'
import {CreateContactRequest} from "../types/CreateContactRequest";
import {ChangeEvent} from "react";
import {History} from "history";

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface AddContactProps {
  auth: Auth
  history: History
}

interface AddContactState {
  name: string
  phoneNumber: string
  file: any
  uploadState: UploadState
  attachmentUrl: string
  contactId: string
}

export class AddContact extends React.PureComponent<
  AddContactProps,
  AddContactState
  > {
  state: AddContactState = {
    name: '',
    phoneNumber: '',
    file: undefined,
    uploadState: UploadState.NoUpload,
    attachmentUrl: '',
    contactId: ''
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

      if (this.state.file && this.state.contactId) {
        await this.uploadPicture(this.state.contactId)
      }

      this.redirectToHome()

    } catch (e: any) {
      alert('Could not upload file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  private redirectToHome() {
    this.props.history.push('/')
  }

  private uploadPicture = async (contactId: string) => {
    this.setUploadState(UploadState.FetchingPresignedUrl)
    const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), contactId)

    this.setUploadState(UploadState.UploadingFile)
    await uploadFile(uploadUrl, this.state.file)
  }

  private storeContactData = async () => {
    if(!this.state.name) {
      return
    }

    const newContact: CreateContactRequest = {
      name: this.state.name,
      phoneNumber: this.state.phoneNumber
    }

    const {contactId} = await createContact(this.props.auth.getIdToken(), newContact)
    this.setState({
      contactId: contactId
    })
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
      phoneNumber: value
    })
  }

  render() {
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

  private renderUploadedPicture() {
    if(this.state.file) {
      return (
        <Image size='small' src={URL.createObjectURL(this.state.file)}/>
      )
    } else if (this.state.attachmentUrl) {
      return (
        <Image size='small' src={this.state.attachmentUrl}/>
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

}
