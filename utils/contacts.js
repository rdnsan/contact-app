const fs = require('fs');

// create data folder (if not exists)
const dirPath = './data';
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

// create file contacts.json (if not exists)
const dataPath = './data/contacts.json';
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, '[]', 'utf-8');
}

// get data contact
const loadContact = () => {
  const file = fs.readFileSync('data/contacts.json', 'utf-8');
  const contactJson = JSON.parse(file);
  return contactJson;
};

const findContact = (nama) => {
  const contacts = loadContact();

  const contact = contacts.find(
    (contact) => contact.nama.toLowerCase() === nama.toLowerCase()
  );

  return contact;
};

// menuliskan data / timpa file contacts.json dengan data yg baru
const saveContacts = (contacts) => {
  fs.writeFileSync('data/contacts.json', JSON.stringify(contacts));
};

// add new contact
const addContact = (contact) => {
  const contacts = loadContact();
  contacts.push(contact);
  saveContacts(contacts);
};

// check duplicate data
const checkDuplicate = (nama) => {
  const contacts = loadContact();
  return contacts.find((contact) => contact.nama === nama);
};

// delete contact
const deleteContact = (nama) => {
  const contacts = loadContact();
  const filteredContacts = contacts.filter((contact) => contact.nama !== nama);
  saveContacts(filteredContacts);
};

// update contact
const updateContacts = (contactBaru) => {
  const contacts = loadContact();

  // hilangkan kontak lama (nama === oldName)
  const filteredContacts = contacts.filter(
    (contact) => contact.nama !== contactBaru.oldName
  );

  delete contactBaru.oldName;
  filteredContacts.push(contactBaru);
  saveContacts(filteredContacts);
};

module.exports = {
  loadContact,
  findContact,
  addContact,
  checkDuplicate,
  deleteContact,
  updateContacts,
};
