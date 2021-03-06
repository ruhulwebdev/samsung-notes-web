import React from "react";
import onClickOutside from "react-onclickoutside";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import Main from "components/editor-main/main";
import Footer from "components/editor-footer/footer";

import { actions as noteActions } from "reducers/editor/notes";
import { actions as uiActions } from "reducers/editor/ui";
import { actions as footerActions } from "reducers/editor/footer";
import { actions as categoryActions } from "reducers/category";

import "./editor.css";

const { categoryChange, noteChange, titleChange } = uiActions;
const { starFilter, lockFilter } = footerActions;
const { noteSubmit } = noteActions;
const { addCategory } = categoryActions;

class MainForm extends React.Component {
  componentWillReceiveProps({ route }) {
    if (route.name !== this.props.route.name) {
      this.injectRouteInEditor(route);
    }
  }

  // editor methods-------------
  setLocalState = (e, item) => {
    if (item === "note") {
      this.props.noteChange(e);
    } else {
      this.props.titleChange(e);
    }
  };

  // Ui methods---------------------
  handleClickOutside = _ => this.openEditor(false);

  // dispatch the save note action from here when the editor closes
  openEditor = (shouldIopen = true) => {
    const editorEl = document.getElementById("main__editor__ref");

    // save the data when editor closes
    // in this case when `shouldIopen = false`
    // and reset the editor
    if (editorEl.classList.contains("editor-opened") && !shouldIopen)
      this.saveEditorData();

    // if shouldIopen = false;
    // then remove the `editor-opened` class and close editor
    // else add it
    editorEl.classList[shouldIopen ? "add" : "remove"]("editor-opened");
  };

  saveEditorData = _ => {
    // convert the inputs data into raw data to store
    // in the DB and restore them in the note
    const title = this.props.title,
      note = this.props.note;

    // if nothings in the note field
    // we don't do anything
    if (note !== "") {
      // dispatch addNote action to get things going
      this.props.addNote({
        title,
        note,
        category: this.props.category,
        star: this.props.star,
        lock: this.props.lock
      });
    }

    // resets the editor
    this.props.editorReset();

    // inject the props from route
    this.injectRouteInEditor(this.props.route);
  };

  injectRouteInEditor = route => {
    // reset first to prevent duplicate
    this.props.editorReset();

    if (route.filter === "filter" && route.name === "star")
      this.props.starChange();

    if (route.filter === "category") this.props.onCategoryChange(route.name);
  };

  render() {
    return (
      <section id="main__editor__ref" className="c-main-editor">
        <Main
          openEditor={this.openEditor}
          setNote={this.setLocalState}
          {...this.props}
        />

        <Footer
          star={this.props.star}
          starChange={this.props.starChange}
          lockChange={_ => this.props.lockChange(this.props.lock)}
          lock={this.props.lock}
          saveNote={_ => this.openEditor(false)}
        />
      </section>
    );
  }
}

const mapStateToProps = ({
  editor: {
    ui: { categoryEditMode, category, title, note },
    footer: { star, locked: lock }
  },
  route
}) => ({
  categoryEditMode,
  category,
  star,
  lock,
  title,
  note,
  route
});

const mapDispatchToProps = dispatch => ({
  onCategoryChange: _ => dispatch(categoryChange(_)),
  changeCategoryEditMode: _ => dispatch({ type: "CATEGORY_EDITMODE" }),
  addCategory: _ => dispatch(addCategory(_)),
  addNote: (..._) => dispatch(noteSubmit(..._)),
  starChange: _ => dispatch(starFilter()),
  lockChange: _ => dispatch(lockFilter(_)),
  editorReset: _ => dispatch({ type: "RESET_EDITOR" }),
  noteChange: _ => dispatch(noteChange(_)),
  titleChange: _ => dispatch(titleChange(_))
});

// @ts-ignore
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(onClickOutside(MainForm))
);
