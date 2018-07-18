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
                            {idx(data, _ => _.gitHub.user.name)} <br/>@{idx(data, _ => _.gitHub.user.company)}
                        </div>
                            <i className="fas fa-chevron-down"></i>
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
/*
class Repo extends Component{
    constructor(props){
        super(props);
        this.state ={
            repos: [],
        }
    }
    handleClick(input){
        const repolist = this.state.repos.slice();
        repolist.push(input);
        this.setState({
            repos: repolistq
        });

    }
    render(){
        return(
                <div className="repo">
                <h5>Generate a link to get stars for your repos:</h5>
                <div className="input-group repo-input">
                <input id="repo-userinput" type="text" class="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="button-addon2"/>
                <div className="input-group-append">
                <button className="btn btn-secondary" type="button" id="button-addon2" onClick={()=>this.handleClick(document.getElementById('repo-userinput').value)}>Add Star Wanted Repo</button>
                </div>
                </div>
                <div className="added-repo">
                <ul>
                <li><i className="fas fa-times"></i> <img src={repoicon}/> yukims19 / OneProfile</li>
                </ul>

                </div>
                </div>
        )
    }
}
*/
class Repo extends Component{
    render(){
        return(
                <div className="repo">
                <h5>Generate a link to get stars for your repos:</h5>
                <div className="input-group repo-input">
                <input type="text" class="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="button-addon2"/>
                <div className="input-group-append">
                <button className="btn btn-secondary" type="button" id="button-addon2">Add Star Wanted Repo</button>
                </div>
                </div>
                <div className="added-repo">
                <ul>
                <li><i className="fas fa-times"></i> <img src={repoicon}/> yukims19 / OneProfile</li>
                </ul>

                </div>
                </div>
        )
    }
}

class App extends Component {
  render() {
    return (
            <div className="App">
            <ApolloProvider client={client}><GithubInfo /></ApolloProvider>;

            <div className="container">
            <Link />
            <Repo />
            </div>
      </div>
    );
  }
}

export default App;
