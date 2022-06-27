import * as React from 'react'
import {Form, Button, Input, Image} from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile } from '../api/todos-api'

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
  file: any
  uploadState: UploadState
}

export class AddContact extends React.PureComponent<
  AddContactProps,
  AddContactState
  > {
  state: AddContactState = {
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  private fileInputReference = React.createRef<any>()


  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.contactId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e: any) {
      alert('Could not upload file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Add new contact</h1>
        <Form onSubmit={this.handleSubmit}>
          <Input
            id='form-input-name'
            label='Name'
            placeholder="Contact's name"
          />
          <Input
            id='form-input-phone'
            label='Phone'
            placeholder="Contact's phone number"
          />
          <Form.Field>
            <label>Contact picture</label>
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

  renderUploadedPicture() {
    if(this.state.file) {
      return (
        <Image class='ui image' size='small' src={URL.createObjectURL(this.state.file)}/>
      )
    }

    return (
      <span>No image selected</span>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Add
        </Button>
      </div>
    )
  }
}
