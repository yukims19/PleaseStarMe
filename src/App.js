import React, { Component } from "react";
import repoicon from "./img/repo.png";
import "./App.css";
import OneGraphApolloClient from "onegraph-apollo-client";
import OneGraphAuth from "onegraph-auth";
import { gql } from "apollo-boost";
import { ApolloProvider, Query, Mutation } from "react-apollo";
import idx from "idx";
import Autosuggest from "react-autosuggest";

const APP_ID = "0e79f79d-6a0a-4413-b311-5d9c8db1b5c7";
const auth = new OneGraphAuth({
  appId: APP_ID,
  oauthFinishPath: "/index.html"
});

const client = new OneGraphApolloClient({
  oneGraphAuth: auth
});

let URL = window.location.href; //http://localhost:3000/?githubUser=yuki19&repos=yukims19/OneProfile;
//  "http://localhost:3000/?githubUser=yukims19&repos=yukims19/OneProfile+yukims19/PleaseStarMe"

if (URL[URL.length - 1] === "+") {
  URL = URL.slice(0, URL.length - 1);
}
const urlparams = URL.includes("?") ? URL.split("?")[1].split("&") : "";
let params = {
  githubUser: null,
  repos: []
};
if (urlparams) {
  urlparams.forEach(e => {
    if (e.includes("=")) {
      if (e.includes("repos")) {
        params[e.split("=")[0]].push.apply(
          params[e.split("=")[0]],
          e.split("=")[1].split("+")
        );
      } else {
        params[e.split("=")[0]] = e.split("=")[1];
      }
    }
  });
}

let userreposAll = [];
const getSuggestions = value => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;
  return inputLength === 0
    ? ["none"]
    : userreposAll.filter(
        repo => repo.toLowerCase().slice(0, inputLength) === inputValue
      );
};

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion;

// Use your imagination to render suggestions.
const renderSuggestion = suggestion =>
  <div>
    {suggestion}
  </div>;

class RepoInput extends Component {
  constructor() {
    super();
    this.state = {
      value: "",
      suggestions: []
    };
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: "ex. Organization/RepoName",
      value,
      onChange: this.onChange,
      id: "repo-userinput"
    };

    // Finally, render it!
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />
    );
  }
}

const GET_GithubQuery = gql`
  query {
    me {
      github {
        avatarUrl
        company
        login
        name
        id
        location
        websiteUrl
        email
      }
    }
  }
`;

class GithubInfo extends Component {
  render() {
    return (
      <Query query={GET_GithubQuery}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          return (
            <div>
              <div className="container">
                <Repo
                  login={idx(data, _ => _.me.github.login)}
                  avatarUrl={idx(data, _ => _.me.github.avatarUrl)}
                  company={idx(data, _ => _.me.github.company)}
                  location={idx(data, _ => _.me.github.location)}
                  email={idx(data, _ => _.me.github.email)}
                  websiteUrl={idx(data, _ => _.me.github.websiteUrl)}
                  name={idx(data, _ => _.me.github.name)}
                />
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}
const GET_MyGithubRepos = gql`
  query($login: String!) {
    gitHub {
      user(login: $login) {
        repositories(first: 100) {
          nodes {
            id
            description
            nameWithOwner
          }
        }
      }
    }
  }
`;

class MyGithubRepos extends Component {
  render() {
    return (
      <Query query={GET_MyGithubRepos} variables={{ login: this.props.login }}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          if (idx(data, _ => _.gitHub.user.repositories.nodes)) {
            userreposAll = data.gitHub.user.repositories.nodes.map(e => {
              return e.nameWithOwner;
            });
          }
          return (
            <div className="autoInput">
              <RepoInput />
            </div>
          );
        }}
      </Query>
    );
  }
}

class Link extends Component {
  handleClickCopy() {
    var copyText = document.getElementById("url-params");
    // Select the text field
    copyText.select();
    //copyText2.select();

    //Copy the text inside the text field
    document.execCommand("copy");
  }
  render() {
    var repos = "";
    if (this.props.repos) {
      this.props.repos.forEach(e => {
        repos = repos + e + "+";
      });
    }
    return (
      <div className="link">
        <input
          type="text"
          className="form-control"
          id="url-params"
          value={
            "https://pleasestarme.com/?githubUser=" +
            this.props.user +
            "&repos=" +
            repos
          }
          readOnly
        />
        <button
          className="btn btn-primary"
          type="button"
          id="button-addon2"
          onClick={() => this.handleClickCopy()}
        >
          Copy Link to Share
        </button>
      </div>
    );
  }
}

class Repo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repos: []
    };
  }
  handleClickAdd(input) {
    //Need to check if the repo name is valid!
    if (input.match(/[a-zA-Z]/)) {
      const repolist = this.state.repos.slice();
      if (!repolist.includes(input)) {
        repolist.push(input);
      }
      this.setState({
        repos: repolist
      });
      /*TODO !!Reset Not Working*/
      //document.getElementsByClassName("react-autosuggest__input").value = " ";
      //document.getElementById("repo-userinput").value = " ";
    } else {
      alert("Invalid input");
    }
  }
  handleClickDelete(e) {
    const repolist = this.state.repos.slice();
    var index = repolist.indexOf(e);
    var list1 = repolist.slice(0, index);
    var list2 = repolist.slice(index + 1, repolist.length);
    var list = list1.concat(list2);
    this.setState({
      repos: list
    });
  }
  render() {
    return (
      <div className="repo">
        <div className="input-group repo-input">
          <MyGithubRepos login={this.props.login} />

          <div className="input-group-append">
            <button
              className="btn btn-secondary"
              type="button"
              id="button-addon2"
              onClick={() =>
                this.handleClickAdd(
                  document.getElementById("repo-userinput").value
                )}
            >
              Add Star Wanted Repo
            </button>
          </div>
        </div>
        <div className="container repo-data">
          <div className="row">
            <div className="col-md-6 userinfo">
              <img src={this.props.avatarUrl} alt="user avatar" />
              <div className="username">
                {this.props.login} <br />
                <span>{this.props.company} </span>
              </div>
              <br />
              <small>
                <cite title={this.props.location}>
                  {this.props.location} <i className="fas fa-map-marker-alt" />
                </cite>
              </small>
              <p className="info-list">
                <i className="fas fa-envelope" /> {this.props.email}
                <br />
                <i className="fas fa-globe" />{" "}
                <a href={this.props.websiteUrl}>{this.props.websiteUrl}</a>
              </p>
              <Link repos={this.state.repos} user={this.props.login} />
            </div>
            <div className="col-md-6 added-repo">
              <ul>
                {this.state.repos.map(e => {
                  return (
                    <li key={e} id={e}>
                      <i
                        className="fas fa-times"
                        onClick={() => this.handleClickDelete(e)}
                      />{" "}
                      <img src={repoicon} alt="repoIcon" /> {e}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class LoginButton extends Component {
  render() {
    return (
      <button
        className={"loginbtn loginbtn-" + this.props.eventClass}
        onClick={this.props.onClick}
      >
        <i className={"fab fa-" + this.props.eventClass} />
        <span> </span>Login with {this.props.event}
      </button>
    );
  }
}
const GET_GithubQueryUser = gql`
  query($github: String!) {
    gitHub {
      user(login: $github) {
        id
        avatarUrl
        url
        login
        name
        location
        company
        email
        websiteUrl
        bio
      }
    }
  }
`;
class GithubInfoUser extends Component {
  render() {
    return (
      <Query
        query={GET_GithubQueryUser}
        variables={{ github: params.githubUser }}
      >
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          if (!idx(data, _ => _.gitHub.user)) return <div>No Data Found</div>;
          return (
            <div className="github-userinfo">
              <a
                href={idx(data, _ => _.gitHub.user.url)}
                className="user-image"
              >
                {" "}<img
                  src={idx(data, _ => _.gitHub.user.avatarUrl)}
                  alt="user avatar"
                />
              </a>
              <div className="user-detail">
                <h4>
                  <a href={idx(data, _ => _.gitHub.user.url)}>
                    {idx(data, _ => _.gitHub.user.login)}
                  </a>{" "}
                  ({idx(data, _ => _.gitHub.user.name)})
                </h4>
                <small>
                  <cite title={this.props.location}>
                    {idx(data, _ => _.gitHub.user.location)}{" "}
                    <i className="fas fa-map-marker-alt" />
                  </cite>
                </small>
                <br />
                {idx(data, _ => _.gitHub.user.bio)}
                <p className="info-list">
                  <i className="fas fa-envelope" />{" "}
                  {idx(data, _ => _.gitHub.user.email)}
                  <br />
                  <i className="fas fa-globe" />{" "}
                  <a href={idx(data, _ => _.gitHub.user.websiteUrl)}>
                    {idx(data, _ => _.gitHub.user.websiteUrl)}
                  </a>
                </p>
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}

const GET_RepoId = gql`
  query($github: String!, $repoName: String!, $repoOwner: String!) {
    gitHub {
      repository(name: $repoName, owner: $repoOwner) {
        id
        viewerHasStarred
      }
    }
  }
`;
class RepoId extends Component {
  render() {
    return (
      <Query
        query={GET_RepoId}
        variables={{
          github: params.githubUser,
          repoName: this.props.repoName,
          repoOwner: this.props.repoOwner
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return (
              <div className="star-data">
                <i className="fas fa-exclamation-triangle" /> Could not find
                repo "{this.props.repoOwner}/{this.props.repoName}"
              </div>
            );
          }
          return (
            <div className="star-data">
              <input
                id={this.props.repoName}
                type="hidden"
                value={
                  data.gitHub.repository.id +
                  "/" +
                  data.gitHub.repository.viewerHasStarred
                }
              />
              <ApolloProvider client={client}>
                <ADDStar
                  reponame={this.props.repo}
                  stared={data.gitHub.repository.viewerHasStarred}
                />
              </ApolloProvider>
            </div>
          );
        }}
      </Query>
    );
  }
}

const Add_Star = gql`
  mutation($id: String!, $repoName: String!) {
    gitHub {
      addStar(input: { clientMutationId: $repoName, starrableId: $id }) {
        clientMutationId
      }
    }
  }
`;

const Remove_Star = gql`
  mutation($id: String!, $repoName: String!) {
    gitHub {
      removeStar(input: { clientMutationId: $repoName, starrableId: $id }) {
        clientMutationId
      }
    }
  }
`;

class ADDStar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stared: this.props.stared
    };
  }
  handleClicktoggle() {
    this.setState({
      stared: !this.state.stared
    });
  }
  render() {
    var action = this.state.stared ? Remove_Star : Add_Star;
    return (
      <Mutation mutation={action}>
        {(handleClick, { data }) =>
          <li key={this.props.reponame}>
            <i
              className={"fas fa-star " + (this.state.stared ? "active" : "")}
              onClick={e => {
                e.preventDefault();
                this.handleClicktoggle();
                handleClick({
                  variables: {
                    id: document.getElementById(
                      this.props.reponame.split("/")[1]
                    ).value,
                    repoName: this.props.reponame
                  }
                });
              }}
            />{" "}
            {/*<img src={repoicon} /> */}
            {this.props.reponame}
          </li>}
      </Mutation>
    );
  }
}

class AppGetStar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      github: false,
      githubUser: null
    };
    this.isLoggedIn("github");
  }
  isLoggedIn(event) {
    auth.isLoggedIn(event).then(isLoggedIn => {
      this.setState({
        [event]: isLoggedIn
      });
    });
  }
  handleClick(service) {
    try {
      auth.login(service).then(() => {
        auth.isLoggedIn(service).then(isLoggedIn => {
          if (isLoggedIn) {
            console.log("Successfully logged in to " + service);
            this.setState({
              [service]: isLoggedIn
            });
          } else {
            console.log("Did not grant auth for service " + service);
            this.setState({
              service: isLoggedIn
            });
          }
        });
      });
    } catch (e) {
      console.error("Problem logging in", e);
    }
  }
  handleStar(repo, value) {
    this.props
      .mutate({
        variables: { repoFullName: "apollographql/apollo-client" }
      })
      .then(({ data }) => {
        console.log("got data", data);
      })
      .catch(error => {
        console.log("there was an error sending the query", error);
      });
  }
  renderLogin(eventTitle, eventClass) {
    return (
      <div className="login-content">
        <h4>Let's get starts for your repos!</h4>
        <LoginButton
          event={eventTitle}
          eventClass={eventClass}
          onClick={() => this.handleClick(eventClass)}
        />
      </div>
    );
  }
  render() {
    var content;
    if (this.state.github) {
      if (URL.includes("?githubUser=")) {
        content = (
          <div>
            <ApolloProvider client={client}>
              <GithubInfoUser />
            </ApolloProvider>
            <div className="added-repo">
              <p>
                {params.githubUser} wants your GitHub love on the repos:
              </p>
              <ul>
                {params.repos.map(e => {
                  return (
                    <ApolloProvider client={client} key={e}>
                      <RepoId
                        repo={e}
                        repoName={e.split("/")[1]}
                        repoOwner={e.split("/")[0]}
                      />
                    </ApolloProvider>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      } else {
        content = (
          <div>
            <ApolloProvider client={client}>
              <GithubInfo />
            </ApolloProvider>
          </div>
        );
      }
    } else {
      content = this.renderLogin("GitHub", "github");
    }
    return (
      <div className="App">
        <div className="header">
          <h1>
            <i className="fas fa-star" /> PleaseStarMe - Share Your GitHub Love!
          </h1>
        </div>
        {content}
        <div className="card-footer text-muted">
          Made with <i className="fas fa-heart" /> By Youxi Li on OneGraph
        </div>
      </div>
    );
  }
}

export default AppGetStar;
