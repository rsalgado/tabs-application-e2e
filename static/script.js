/*
TODO:
  - Read note in comments for "person-card" component. Consider refactoring further to follow best practices.
*/


// ------------------- General classes and constants for just JS and business logic ----------------------

// This class generates sequences of numbers that I'll use as ids.
class SequenceGenerator {
  constructor(initialValue = 0) {this.value = initialValue;}
  nextId() {return this.value += 1;}}

// Sequence Generators for User ids and Item ids
const USER_ID_GENERATOR = new SequenceGenerator();
const ITEM_ID_GENERATOR = new SequenceGenerator();
// Formatter for money
const MONEY_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2 });


// -------------------------- Classes for main entities: Item and Person ----------------------------------

class Item {
  constructor(name = "", value = 0) {
    this.id = ITEM_ID_GENERATOR.nextId();
    this.name = name;
    this.value = value;
  }}


class Person {
  constructor(name) {
    this.id = USER_ID_GENERATOR.nextId();
    this.name = name;
    this.items = [];
    this.isGuest = false;
  }

  addItem({ name, value }) {
    let newItem = new Item(name, value);
    this.items.push(newItem);
    return newItem.id;
  }

  findItem(id) {return this.items.find(it => it.id === id);}

  removeItem(id) {this.items = this.items.filter(it => it.id !== id);}

  total() {return this.items.reduce((sum, item) => sum + item.value, 0);}}




// ------------------------------- Vue components & filters ----------------------------------------------

let currencyFilter = Vue.filter('formatCurrency', MONEY_FORMATTER.format);

// Component for form to add new person
let personForm = Vue.component("person-form", {
  template: "#person-form-template",
  data() {
    return { name: "" };
  },
  methods: {
    resetPersonForm() {this.name = "";},
    createPerson() {
      this.$emit("add-person", this.name);
      this.resetPersonForm();
    } } });



// Component for form to add a new item to the a person's list of items
let newItemForm = Vue.component("new-item-form", {
  template: "#new-item-form-template",
  data() {
    return {
      name: "",
      value: null };

  },
  methods: {
    resetItemForm() {
      this.name = "";
      this.value = null;
    },

    createItem() {
      this.$emit("add-item", {
        name: this.name,
        value: this.value });

      this.resetItemForm();
    } } });



// Component for the person cards in the people list
// NOTE: Bear in mind that currently v-model is being used in a way that allows changes to properties of 
// props to propagate to the parents without causing warnings, although it is not something encouraged to do.
// Doing so goes against with the one-way data flow principle. Consider refactoring this.
// See: https://forum.vuejs.org/t/v-model-on-prop/37639
let personCard = Vue.component("person-card", {
  template: "#person-card-template",
  props: ["person", "fee"],
  methods: {
    removePerson() {this.$emit("remove-person", this.person);},
    selectPerson() {this.$emit("select-person", this.person);} } });



// Vue.js instance application
let app = new Vue({
  el: "#app",
  data() {
    return {
      people: [],
      selectedPerson: {} };

  },

  methods: {
    addPerson(name) {
      let newPerson = new Person(name);
      this.people.push(newPerson);
      return newPerson;
    },

    findPerson(id) {return this.people.find(p => p.id === id);},

    removePerson(person) {
      // Weird behaviour
      // TODO: Find out why setting `this.selectedPerson = {};` doesn't reflect correctly
      if (this.selectedPerson.id == person.id)
      this.selectedPerson.name = null;

      this.people = this.people.filter(p => p.id !== person.id);
    },

    selectPerson(person) {this.selectedPerson = person;},

    addItem(item) {this.selectedPerson.addItem(item);} },


  computed: {
    individualFee() {
      let guests = this.people.filter(p => p.isGuest);
      let total = guests.reduce((sum, p) => sum + p.total(), 0);
      return total / (this.people.length - guests.length);
    },

    total() {
      return this.people.
      map(p => p.total()).
      reduce((sum, t) => sum + t, 0);
    } } });




// ----------------------------- Example inputs inserted programmatically. ---------------------------------

let p1 = app.addPerson("David");
let p2 = app.addPerson("Angie");
let p3 = app.addPerson("Mary");
let p4 = app.addPerson("Jesus");
let p5 = app.addPerson("Service");

p1.addItem({ name: "Item 1", value: 1200 });
p1.addItem({ name: "Item 2", value: 3900 });

p2.addItem({ name: "Item 1", value: 2300 });
p2.addItem({ name: "Item 2", value: 4200 });

p3.addItem({ name: "Item 1", value: 2100 });
p3.addItem({ name: "Item 2", value: 5300 });

p4.addItem({ name: "Item 1", value: 750 });
p4.addItem({ name: "Item 2", value: 1990 });

p5.addItem({ name: "Service & Tips", value: 4500 });
p5.isGuest = true;