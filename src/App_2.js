import React, { Component } from "react";
import repoicon from "./img/repo.png";
import "./App.css";
import OneGraphApolloClient from "onegraph-apollo-client";
import OneGraphAuth from "onegraph-auth";
import { gql } from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";
import idx from "idx";

const auth = new OneGraphAuth({
  appId: "0e79f79d-6a0a-4413-b311-5d9c8db1b5c7",
  oauthFinishPath: "/index.html"
});

const APP_ID = "0e79f79d-6a0a-4413-b311-5d9c8db1b5c7";
const client = new OneGraphApolloClient({
  oneGraphAuth: auth
});

const GET_GithubQuery = gql`
  query {
    me {
      github {
        avatarUrl
        company
        login
        name
        id
      }
    }
  }
`;

const GET_GithubQueryUser = gql`
  query($github: String!) {
    gitHub {
      user(login: $github) {
        id
        avatarUrl
        url
        login
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
              <div className="header">
                <img src={idx(data, _ => _.me.github.avatarUrl)} />
                <div className="username">
                  {idx(data, _ => _.me.github.login)} <br />
                  <span>{idx(data, _ => _.me.github.company)}</span>
                </div>
                {/*<i className="fas fa-chevron-down"></i>*/}
              </div>
              <div className="container" />
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
    var copyText2 = document.getElementById("basic-url");
    /* Select the text field */
    copyText.select();
    //copyText2.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
  }
  render() {
    return <div className="link" />;
  }
}
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
            <div className="container">
              <div className="row github-userinfo">
                <div className="col-md-2 offset-md-3">
                  <a href={idx(data, _ => _.gitHub.user.url)}>
                    {" "}<img src={idx(data, _ => _.gitHub.user.avatarUrl)} />
                  </a>
                </div>
                <div className="col-md-4 user-info">
                  <h4>
                    <a href={idx(data, _ => _.gitHub.user.url)}>
                      {idx(data, _ => _.gitHub.user.login)}
                    </a>
                  </h4>
                  <p className="info-list">
                    Total Repositories:{" "}
                    {idx(data, _ => _.gitHub.user.repositories.totalCount)}
                    <br />
                    Following:{" "}
                    {idx(data, _ => _.gitHub.user.following.totalCount)}
                    <br />
                    Follwer:{" "}
                    {idx(data, _ => _.gitHub.user.followers.totalCount)}
                    <br />
                  </p>
                  <button>Follow</button>
                </div>
                <Repo user={idx(data, _ => _.me.github.login)} />
              </div>
            </div>
          );
        }}
      </Query>
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
      document.getElementById("repo-userinput").value = "";
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
        <Link repos={this.state.repos} user={this.props.user} />
        <div className="added-repo">
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

class App extends Component {
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
        <h1>Welcome to PleaseStarMe</h1>
        <h4>Let's get starts for your repos</h4>
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
      content = (
        <div>
          <ApolloProvider client={client}>
            <GithubInfo />
          </ApolloProvider>
          <ApolloProvider client={client}>
            <GithubInfoUser />
          </ApolloProvider>
        </div>
      );
    } else {
      content = this.renderLogin("GitHub", "github");
    }
    return (
      <div className="App">
        {content}
      </div>
    );
  }
}

export default App;
