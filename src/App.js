import React, { Component } from "react";
import repoicon from "./img/repo.png";
import "./App.css";
import OneGraphApolloClient from "onegraph-apollo-client";
import OneGraphAuth from "onegraph-auth";
import { gql } from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";
import idx from "idx";
import Autosuggest from "react-autosuggest";

const auth = new OneGraphAuth({
  appId: "0e79f79d-6a0a-4413-b311-5d9c8db1b5c7",
  oauthFinishPath: "/index.html"
});

const APP_ID = "0e79f79d-6a0a-4413-b311-5d9c8db1b5c7";
const client = new OneGraphApolloClient({
  oneGraphAuth: auth
});

const URL = window.location.href; //http://localhost:3000/?githubUser=yuki19&repos=yukims19/OneProfile;

let userrepos = [];

const getSuggestions = value => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;
  return inputLength === 0
    ? ["none"]
    : userrepos.filter(
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
            userrepos = data.gitHub.user.repositories.nodes.map(e => {
              return e.nameWithOwner;
            });
            console.log(
              data.gitHub.user.repositories.nodes.map(e => {
                return e.nameWithOwner;
              })
            );
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
      repolist.push(input);
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
              <img src={this.props.avatarUrl} />
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
                    <li key={e}>
                      <i
                        className="fas fa-times"
                        onClick={() => this.handleClickDelete(e)}
                      />{" "}
                      <img src={repoicon} /> {e}
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
        followers {
          totalCount
        }
        following {
          totalCount
        }
        repositories(
          first: 6
          orderBy: { direction: DESC, field: UPDATED_AT }
        ) {
          nodes {
            id
            description
            url
            name
            forks {
              totalCount
            }
            stargazers {
              totalCount
            }
            languages(first: 1, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node {
                  id
                  color
                  name
                }
              }
            }
          }
          totalCount
        }
      }
    }
  }
`;
class GithubInfoUser extends Component {
  render() {
    return (
      <Query query={GET_GithubQueryUser} variables={{ github: "sgrove" }}>
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
                {" "}<img src={idx(data, _ => _.gitHub.user.avatarUrl)} />
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
      if (URL.includes("?")) {
        content = (
          <div>
            <ApolloProvider client={client}>
              <GithubInfoUser />
            </ApolloProvider>
            <div className="added-repo">
              <p>Sean wants your GitHub love on the repos:</p>
              <ul>
                <li>
                  <i className="far fa-star" /> <img src={repoicon} />yukims19 /
                  OneProfile
                </li>
                <li>
                  <i className="far fa-star" /> <img src={repoicon} />yukims19 /
                  OneProfile
                </li>
                <li>
                  <i className="far fa-star" /> <img src={repoicon} />yukims19 /
                  OneProfile
                </li>
                <li>
                  <i className="far fa-star" /> <img src={repoicon} />yukims19 /
                  OneProfile
                </li>

                {/*this.state.repos.map((e)=>{
                            return(
                            <li><i className="fas fa-times" onClick={()=>this.handleClickDelete(e)}></i> <img src={repoicon}/> {e}</li>
                            )
                          })*/}
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
            <i class="fas fa-star" /> PleaseStarMe - Share Your GitHub Love!
          </h1>
        </div>
        {content}
        <div class="card-footer text-muted">
          Made with <i className="fas fa-heart" /> By Youxi Li on OneGraph
        </div>
      </div>
    );
  }
}

export default AppGetStar;
