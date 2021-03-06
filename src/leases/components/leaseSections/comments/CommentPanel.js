//@flow
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {initialize, isDirty} from 'redux-form';
import {withRouter} from 'react-router';
import classNames from 'classnames';
import flowRight from 'lodash/flowRight';
import isEmpty from 'lodash/isEmpty';

import {ActionTypes, AppConsumer} from '$src/app/AppContext';
import Authorization from '$components/authorization/Authorization';
import CheckboxInput from '$components/inputs/CheckboxInput';
import CloseButton from '$components/button/CloseButton';
import Comment from './Comment';
import FormText from '$components/form/FormText';
import NewCommentForm from './NewCommentForm';
import {
  clearEditFlags,
  createComment,
  fetchCommentsByLease,
  receiveIsSaveClicked,
} from '$src/comments/actions';
import {ButtonColors, CloseCommentPanelTexts, FormNames} from '$components/enums';
import {CommentFieldPaths} from '$src/comments/enums';
import {Methods} from '$src/enums';
import {
  getFieldOptions,
  isFieldAllowedToEdit,
  isMethodAllowed,
  sortStringByKeyDesc,
} from '$util/helpers';
import {getContentComments} from '$src/leases/helpers';
import {
  getAttributes as getCommentAttributes,
  getCommentsByLease,
  getEditModeFlags,
  getMethods as getCommentMethods,
} from '$src/comments/selectors';
import {getCurrentLease} from '$src/leases/selectors';

import type {Attributes, Methods as MethodsType} from '$src/types';
import type {CommentList} from '$src/comments/types';
import type {Lease} from '$src/leases/types';

type Props = {
  clearEditFlags: Function,
  commentAttributes: Attributes,
  commentList: CommentList,
  commentMethods: MethodsType,
  createComment: Function,
  currentLease: Lease,
  editModeFlags: Object,
  fetchCommentsByLease: Function,
  initialize: Function,
  isNewCommentFormDirty: boolean,
  isOpen: boolean,
  onClose: Function,
  match: {
    params: Object,
  },
  receiveIsSaveClicked: Function,
}

type State = {
  allowEdit: boolean,
  commentAttributes: Attributes,
  commentMethods: MethodsType,
  comments: Array<Object>,
  commentList: CommentList,
  isClosing: boolean,
  isOpening: boolean,
  selectedTopics: Array<string>,
  topicOptions: Array<Object>,
}

const getCommentsByTopic = (comments: Array<Object>, topic: Object): Array<Object> => {
  if(!comments || !comments.length) {return [];}
  return comments.filter((comment) => comment.topic === topic.value);
};

class CommentPanel extends PureComponent<Props, State> {
  component: any
  firstCommentModalField: any

  state = {
    allowEdit: false,
    commentAttributes: null,
    commentMethods: null,
    comments: [],
    commentList: [],
    isClosing: false,
    isOpening: false,
    selectedTopics: [],
    topicOptions: [],
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    const newState = {};

    if(props.commentList !== state.commentList) {
      newState.commentList = props.commentList;
      newState.comments = getContentComments(props.commentList);
    }

    if(props.commentAttributes !== state.commentAttributes) {
      newState.commentAttributes = props.commentAttributes;
      newState.topicOptions = getFieldOptions(props.commentAttributes, CommentFieldPaths.TOPIC, false);
    }

    if(props.commentMethods !== state.commentMethods || props.commentAttributes !== state.commentAttributes) {
      newState.commentAttributes = props.commentAttributes;
      newState.commentMethods = props.commentMethods;
      newState.allowEdit = isFieldAllowedToEdit(props.commentAttributes, CommentFieldPaths.TOPIC) && isMethodAllowed(props.commentMethods, Methods.PATCH);
    }

    return newState;
  }

  componentDidMount() {
    const {
      commentList,
      commentMethods,
      fetchCommentsByLease,
      match: {params: {leaseId}},
      receiveIsSaveClicked,
    } = this.props;

    if(isEmpty(commentList) && isMethodAllowed(commentMethods, Methods.GET)) {
      fetchCommentsByLease(leaseId);
    }

    receiveIsSaveClicked(false);

    this.component.addEventListener('transitionend', this.transitionEnds);
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.isOpen && this.props.isOpen) {
      this.initializeNewCommentForm();

      this.setState({
        isOpening: true,
      });
    } else if(prevProps.isOpen && !this.props.isOpen) {
      this.setState({
        isClosing: true,
      });
    }
  }

  componentWillUnmount() {
    const {clearEditFlags} = this.props;

    clearEditFlags();
    this.component.removeEventListener('transitionend', this.transitionEnds);
  }

  transitionEnds = () => {
    const {isClosing} = this.state;
    const {clearEditFlags} = this.props;

    if(isClosing) {
      clearEditFlags();
    }

    this.setState({
      isClosing: false,
      isOpening: false,
    });
  }

  getFilteredComments = () => {
    const {comments, selectedTopics} = this.state;
    const sortedComments = [...comments].sort((a, b) => sortStringByKeyDesc(a, b, 'modified_at'));

    return selectedTopics.length
      ? sortedComments.filter((comment) => selectedTopics.indexOf(comment.topic) !== -1)
      : sortedComments;
  }

  setComponentRef = (element: any) => {
    this.component = element;
  }

  createComment = (text: string, topic: number) => {
    const {
      createComment,
      currentLease,
    } = this.props;

    createComment({
      lease: currentLease.id,
      text: text,
      topic: topic,
    });
  }

  initializeNewCommentForm = () => {
    const {initialize} = this.props;

    initialize(FormNames.NEW_COMMENT, {text: '', topic: ''});
  }

  handleFilterChange = (value: Array<string>) => {
    this.setState({selectedTopics: value});
  }

  render () {
    const {
      commentMethods,
      editModeFlags,
      isNewCommentFormDirty,
      isOpen,
      onClose,
      receiveIsSaveClicked,
    } = this.props;
    const {
      allowEdit,
      comments,
      isClosing,
      isOpening,
      selectedTopics,
      topicOptions,
    } = this.state;
    const filteredComments = this.getFilteredComments();

    return (
      <div ref={this.setComponentRef} className={classNames('comment-panel', {'is-panel-open': isOpen})}>
        <div hidden={!isOpen && !isClosing && !isOpening}>
          <div className='comment-panel__wrapper'>
            <div className='comment-panel__title'>
              <h1>Kommentit</h1>
              <AppConsumer>
                {({dispatch}) => {
                  const isAnyCommentEditOpen = () => {
                    if(isEmpty(editModeFlags)) return false;

                    for(const key of Object.keys(editModeFlags)) {
                      if(editModeFlags[key]) return true;
                    }

                    return false;
                  };

                  const handleClose = () => {
                    if(isNewCommentFormDirty || isAnyCommentEditOpen()) {
                      dispatch({
                        type: ActionTypes.SHOW_CONFIRMATION_MODAL,
                        confirmationFunction: () => {
                          onClose();
                          receiveIsSaveClicked(false);
                        },
                        confirmationModalButtonClassName: ButtonColors.ALERT,
                        confirmationModalButtonText: CloseCommentPanelTexts.BUTTON,
                        confirmationModalLabel: CloseCommentPanelTexts.LABEL,
                        confirmationModalTitle: CloseCommentPanelTexts.TITLE,
                      });
                    } else {
                      onClose();
                      receiveIsSaveClicked(false);
                    }
                  };

                  return(
                    <CloseButton
                      className='position-topright'
                      onClick={handleClose}
                      title='Sulje'
                    />
                  );
                }}
              </AppConsumer>
            </div>

            <Authorization allow={isMethodAllowed(commentMethods, Methods.POST)}>
              <NewCommentForm onAddComment={this.createComment} />
            </Authorization>

            {comments && !!comments.length && topicOptions && !!topicOptions.length &&
              <div className='comment-panel__filters'>
                <span className='comment-panel__filters-title'>Suodatus</span>

                <CheckboxInput
                  checkboxName='checkbox-buttons-document-type'
                  legend='Suodata kommentteja'
                  onChange={this.handleFilterChange}
                  options={topicOptions}
                  value={selectedTopics}
                />
              </div>
            }

            {!filteredComments || !filteredComments.length &&
              <div className='comment-panel__comments'>
                <FormText>Ei kommentteja</FormText>
              </div>
            }
            {filteredComments && !!filteredComments.length &&
              <div className='comment-panel__comments'>
                {topicOptions && !!topicOptions.length && topicOptions.map((topic) => {
                  const comments = getCommentsByTopic(filteredComments, topic);

                  if(!comments.length) return null;

                  return (
                    <div className='comment-panel__comments-section' key={topic.value}>
                      <h3>{topic.label}</h3>
                      {comments.map((comment) =>
                        <Comment
                          key={comment.id}
                          allowEdit={allowEdit}
                          comment={comment}
                          user={comment.user}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default flowRight(
  // $FlowFixMe
  withRouter,
  connect(
    (state) => {
      const currentLease = getCurrentLease(state);

      return {
        commentAttributes: getCommentAttributes(state),
        commentList: getCommentsByLease(state, currentLease.id),
        commentMethods: getCommentMethods(state),
        currentLease: currentLease,
        editModeFlags: getEditModeFlags(state),
        isNewCommentFormDirty: isDirty(FormNames.NEW_COMMENT)(state),
      };
    },
    {
      clearEditFlags,
      createComment,
      fetchCommentsByLease,
      initialize,
      receiveIsSaveClicked,
    },
  ),
)(CommentPanel);
