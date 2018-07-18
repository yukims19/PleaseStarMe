import React, { Component } from 'react';
import repoicon from './img/repo.png';
import './App.css';
import OneGraphApolloClient from 'onegraph-apollo-client';
import OneGraphAuth from 'onegraph-auth';
import {gql} from 'apollo-boost';
import {ApolloProvider, Query} from 'react-apollo';
import idx from 'idx';


const auth = new OneGraphAuth({
    appId: '0e79f79d-6a0a-4413-b311-5d9c8db1b5c7',
    oauthFinishPath: "/index.html",
});

const APP_ID = '0e79f79d-6a0a-4413-b311-5d9c8db1b5c7';
const client = new OneGraphApolloClient({
    oneGraphAuth: auth,
});

const GET_GithubQuery = gql`
query($github: String!) {
  gitHub {
    user(login: $github) {
      id
      avatarUrl
      url
      login
      company
      name
      followers {
        totalCount
      }
      following {
        totalCount
      }
    }
  }
}
`;
class GithubInfo extends Component{
    render(){
        return(
                <Query query={GET_GithubQuery}  variables = {{github: "sgrove"}}>
                {({loading, error, data}) => {
                    if (loading) return <div>Loading...</div>;
                    if (error) {
                        console.log(error);
                        return <div>Uh oh, something went wrong!</div>};
                    return (
                            <div className="header">
                            <img src={idx(data, _ => _.gitHub.user.avatarUrl)} />
                            <div className="username">
                            {idx(data, _ => _.gitHub.user.name)} <br/>
                            <span>{idx(data, _ => _.gitHub.user.company)}</span>
                            </div>
                            {/*<i className="fas fa-chevron-down"></i>*/}
                            </div>

                    )
                }}
                </Query>
        )
    }
}

class Link extends Component{
    render(){
        return(
                <div className="link">
                <div className="input-group mb-3">
                <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon3">https://pleasestarme.com/?query=</span>
                </div>
                <input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3" />
                <div className="input-group-append">
                <button className="btn btn-primary" type="button" id="button-addon2">Copy Link to Share</button>
                </div>
                </div>

            </div>
        )
    }
}

class Repo extends Component{
    constructor(props){
        super(props);
        this.state ={
            repos: [],
        }
    }
    handleClick(input){
        //Need to check if the repo name is valid!
        const repolist = this.state.repos.slice();
        repolist.push(input);
        this.setState({
            repos: repolist,
        });

    }
    render(){
        return(
                <div className="repo">
                <h5>Generate a link to get stars for your repos:</h5>
                <div className="input-group repo-input">
                <input id="repo-userinput" type="text" class="form-control" placeholder="ex. Organization / RepoName" aria-label="Recipient's username" aria-describedby="button-addon2"/>
                <div className="input-group-append">
                <button className="btn btn-secondary" type="button" id="button-addon2" onClick={()=>this.handleClick(document.getElementById('repo-userinput').value)}>Add Star Wanted Repo</button>
                </div>
                </div>
                <div className="added-repo">
                <ul>
                {this.state.repos.map((e)=>{
                    return(
                            <li><i className="fas fa-times"></i> <img src={repoicon}/> {e}</li>
                    )
                })}
                </ul>

                </div>
                </div>
        )
    }
}

class LoginButton extends Component{
    render(){
        return(
                <button
            className={"loginbtn loginbtn-"+ this.props.eventClass}
            onClick={this.props.onClick}>
                <i className={"fab fa-"+this.props.eventClass}></i>
                <span>  </span>Login with {this.props.event}
            </button>
        )
    }

}

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            github: false,
        };
        this.isLoggedIn('github');
    }
    isLoggedIn(event){
        auth.isLoggedIn(event).then(isLoggedIn => {
            this.setState({
                [event]: isLoggedIn
            })
        });
    }
    handleClick(service){
        try {
            auth.login(service).then(() => {
                auth.isLoggedIn(service).then(isLoggedIn => {
                    if (isLoggedIn) {
                        console.log('Successfully logged in to ' + service);
                        this.setState({
                            [service]: isLoggedIn
                        });
                    } else {
                        console.log('Did not grant auth for service ' + service);
                        this.setState({
                            service: isLoggedIn
                        });
                    }
                });
            });
        } catch (e) {
            console.error('Problem logging in', e);
        }
    }
    renderLogin(eventTitle, eventClass){
        return(
                <div className="login-content">
                <h1>Welcome to PleaseStarMe</h1>
                <h4>Let's get starts for your repos</h4>
                <LoginButton
            event= {eventTitle}
            eventClass= {eventClass}
            onClick={()=>this.handleClick(eventClass)} />
                </div>
        );
    }
    render() {
        var content;
        if(this.state.github){
            content =<div>
                <ApolloProvider client={client}><GithubInfo /></ApolloProvider>
                <div className="container">
                <Link />
                <Repo />
                </div>
                </div>;
        }else{
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
