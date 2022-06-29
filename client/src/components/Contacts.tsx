import dateFormat from 'dateformat'
import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader
} from 'semantic-ui-react'

import {deleteContact, getContacts, getMockContacts} from '../api/todos-api'
import Auth from '../auth/Auth'
import {Contact} from "../types/Contact";

interface ContactsProps {
  auth: Auth
  history: History
}

interface ContactsState {
  contacts: Contact[]
  loadingContacts: boolean
}

export class Contacts extends React.PureComponent<ContactsProps, ContactsState> {
  state: ContactsState = {
    contacts: [],
    loadingContacts: true
  }

  onEditButtonClick = (contactId: string) => {
    this.props.history.push(`/contacts/${contactId}/edit`)
  }

  onContactDelete = async (contactId: string) => {
    try {
      await deleteContact(this.props.auth.getIdToken(), contactId)
      this.setState({
        contacts: this.state.contacts.filter(contact => contact.contactId !== contactId)
      })
    } catch {
      alert('Contact deletion failed')
    }
  }

  onAddContactButtonClick = () => {
    this.props.history.push(`/contacts/add`)
  }

  async componentDidMount() {
    try {
      const contacts = await getMockContacts(this.props.auth.getIdToken())
      this.setState({
        contacts,
        loadingContacts: false
      })
    } catch (e: any) {
      alert(`Failed to fetch contacts: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Contacts</Header>
        {this.renderContacts()}
        {this.renderAddContactButton()}
      </div>
    )
  }

  renderContacts() {
    if (this.state.loadingContacts) {
      return this.renderLoading()
    }

    return this.renderContactsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Contacts
        </Loader>
      </Grid.Row>
    )
  }

  renderContactsList() {
    return (
      <Grid padded>
        {this.state.contacts.map((contact, pos) => {
          return (
            <Grid.Row key={contact.contactId}>
              <Grid.Column width={1} verticalAlign="middle">
                {contact.pictureUrl && (
                  <Image src={contact.pictureUrl} wrapped />
                )}
                {!contact.pictureUrl && (
                  <Icon name='address card outline'/>
                )}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {contact.name}
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle" floated="right">
                {contact.phone}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(contact.contactId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} >
                <Button
                  icon
                  color="red"
                  onClick={() => this.onContactDelete(contact.contactId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  renderAddContactButton() {
    return(
      <Button onClick={() => this.onAddContactButtonClick()}>Add</Button>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
