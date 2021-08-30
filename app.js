const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const {
  loadContact,
  findContact,
  addContact,
  checkDuplicate,
  deleteContact,
  updateContacts,
} = require('./utils/contacts');
const { body, validationResult, check } = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get('/', (req, res) => {
  const maintainers = [
    {
      name: 'Ridwan',
      email: 'ridwan@google.com',
    },
    {
      name: 'Felix',
      email: 'felix@google.com',
    },
    {
      name: 'Ruby',
      email: 'ruby@google.com',
    },
  ];

  res.render('index', {
    name: 'Ridwan',
    title: 'Contact App',
    layout: 'layouts/main',
    maintainers,
  });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About', layout: 'layouts/main' });
});

app.get('/contact', (req, res) => {
  const contacts = loadContact();
  res.render('contact', {
    title: 'Contact',
    layout: 'layouts/main',
    contacts,
    msg: req.flash('msg'),
  });
});

// add contact
app.get('/contact/add', (req, res) => {
  res.render('add-contact', {
    title: 'Tambah Data Kontak',
    layout: 'layouts/main',
  });
});

// add new contact action
app.post(
  '/contact',
  [
    body('nama').custom((value) => {
      const duplicate = checkDuplicate(value);
      if (duplicate) {
        throw new Error('Nama kontak sudah digunakan!');
      }
      return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'No HP tidak valid!').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('add-contact', {
        title: 'Tambah Data Kontak',
        layout: 'layouts/main',
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      req.flash('msg', 'Data kontak berhasil ditambahkan!');
      res.redirect('/contact');
    }
  }
);

// delete contact
app.get('/contact/delete/:nama', (req, res) => {
  const contact = findContact(req.params.nama);

  // if contact data || name not exists
  if (!contact) {
    res.status(404);
    res.send('<h1>404 Not Found</h1>');
  } else {
    deleteContact(req.params.nama);
    req.flash('msg', 'Data kontak berhasil dihapus!');
    res.redirect('/contact');
  }
});

// edit contact
app.get('/contact/edit/:nama', (req, res) => {
  const contact = findContact(req.params.nama);
  res.render('edit-contact', {
    title: 'Ubah Data Kontak',
    layout: 'layouts/main',
    contact,
  });
});

// edit contact action
app.post(
  '/contact/update',
  [
    body('nama').custom((value, { req }) => {
      const duplicate = checkDuplicate(value);
      if (value !== req.body.oldName && duplicate) {
        throw new Error('Nama kontak sudah digunakan!');
      }
      return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'No HP tidak valid!').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('edit-contact', {
        title: 'Ubah Data Kontak',
        layout: 'layouts/main',
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContacts(req.body);
      req.flash('msg', 'Data kontak berhasil diubah!');
      res.redirect('/contact');
    }
  }
);

// detail contact
app.get('/contact/:nama', (req, res) => {
  const contact = findContact(req.params.nama);
  res.render('detail', { title: 'Detail', layout: 'layouts/main', contact });
});

app.use((req, res) => {
  res.status(404);
  res.render('404', { title: 'Not Found', layout: 'layouts/main' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
