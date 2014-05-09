RemoteStorage.defineModule('money', function(privateClient, publicClient) {
  var tabs;
  
  var edges = {}, reachable = {}, nodeNames = {}, cycles = [];
  
    function minBalance(a, b) {
      if(a > 0 && b < 0) {
        if(a > -b) {
          return b;
        } else {
          return a;
        }
      }
      if(a < 0 && b > 0) {
        if(-a > b) {
          return b;
        } else {
          return a; 
        }
      }
      return 0;
    }
    function getEndStates() {
      var i, tabNames = getTabNames(), endStates = {};
      for (i=0; i<tabNames.length; i++) {
        endStates[tabNames[i]] = getEndState(i);
      }
      return endStates;
    }
    function getCyclesGraph() {
      return;
      var i,j,str = '<table border="1"><tr><td>/</td>';
      j=0;
      for(i in edges) {
        nodeNames[i]=j;
        str+='<td>'+i+'</td>';
        j++;
      }
      str+='</tr>';
      for(i in edges) {
        str+='<tr><td>'+i+'</td>';
        for(j in edges) {
          str+='<td id="'+nodeNames[i]+':'+nodeNames[j]+'"></td>';       
        }
        str+='</tr>';
      }
      return str;
    }
    function rotateToMe(arr) {
      //return arr;
      var pos=arr.indexOf('contact:me');
      if(pos==-1) {
        return arr;
      }
      console.log('in', arr.join(' > '));
      console.log('out',Array.concat(arr.slice(pos, arr.length), arr.slice(0, pos)).join(' > '));
      return Array.concat(arr.slice(pos, arr.length), arr.slice(0, pos));
    }
    function inCycles(candidateCycle) {
      var i, j;
      for(i=0; i<cycles.length; i++) {
        if(equal(cycles[i], candidateCycle)) {
          return true;
        }
      }
      return false;
    }
    function equal(arr1, arr2) {
      var i;
      if(arr1.length != arr2.length) {
        return false;
      }
      for(i=0; i<arr1.length; i++) {
        if(arr1[i] != arr2[i]) {
           return false;
        }
      }
      return true;
    }
    function findCycles(markCellCb) {
      var i, j, k, changed, str, candidateCycle;
      console.log('finding cycles in a directed bipartite graph');
        for(i in edges) {
        if(!reachable[i]) {
          reachable[i]={};
        }
        for(j=0;j<edges[i].length;j++) {
          reachable[i][edges[i][j]]=[i];
          markCell(i, edges[i][j]);
        }
      }
      do {
        //console.log(JSON.stringify(reachable));
        changed = false;
        for(i in reachable) {
          //console.log('i',i);
          for(j in reachable[i]) {
            if(i!=j) {
              //console.log('j',j);
              for(k in reachable[j]) {
                //console.log('k',k);
                if(!reachable[i][k]) {
                  changed=true;
                  reachable[i][k]=Array.concat(reachable[i][j], reachable[j][k]);
                  //console.log('found path '+reachable[i][k].join(' > ')+' > '+k);
                  markCell(i, k);
                  if(i==k) {
                    candidateCycle = rotateToMe(reachable[i][k]);
                    if(!inCycles(candidateCycle)) {
                      cycles.push(candidateCycle);
                    }
                    //console.log(str);
                  }
                } else {
                  //console.log(k, 'already reachable from', i);
                }
              }
            }
          }
        }
        if(changed) {
          console.log('found changes.');
        } else {
          console.log('no further changes!');
        }
      } while(changed);
      str='<ul>';
      for(i=0;i<cycles.length;i++) {
        str+='<li>'+cycles[i].join(' > ')+' > '+cycles[i][0]+'</li>';
      }
      return str+'</ul>';
      //console.log(str);
    }
    function contactName(contact, tab) {
      if(contact == 'pot') {
        return 'pot:'+tab;
      }
      if(contact == 'you') {
        return 'contact:'+tab;
      }
      if(contact == remoteStorage.contacts.getMyName()) {
        return 'contact:me';
      }
      return 'contact:'+contact;
    }
        
    function getTabList() {
      var i, j, claims, endBalance, endBalanceStrs, str = '<h2>Tabs</h2><ul>',
        myName, yourName, havePos, haveNeg, tabNames = getTabNames();
      for(i=0; i<tabNames.length; i++) {
        if(!edges['tab:'+i]) {
          edges['tab:'+i]=[];
        }
        claims = remoteStorage.money.getTabClaims(tabNames[i]);
        if(claims.length) {
          endBalance = claims[claims.length-1].sums;
        } else {
          endBalance = {};
        }
        endBalanceStrs = [];
        if(endBalance['me']) {
          myName = 'me';
        } else {
          myName = remoteStorage.contacts.getMyName();
        }
          
        for(j in endBalance) {
          if(!edges[contactName(j, i)]) {
            edges[contactName(j, i)]=[];
          }
          if(endBalance[j]>0) {
            edges[contactName(j, i)].push('tab:'+i);
          } else if(endBalance[j]<0) {
            edges['tab:'+i].push(contactName(j, i));
          }
          endBalanceStrs.push(j+': '+twoDecimals(endBalance[j]));
          if(!remoteStorage.contacts.get(j.toLowerCase()) && ['you', 'me', 'pot'].indexOf(j)==-1) {
            console.log('unknown contact: '+j);
          }
          if(j=='you') {
            yourName = tabNames[i];
          } else {
            yourName = j;
          }
          if(j!=myName && j!='pot' && (minBalance(endBalance[j], endBalance[myName])!=0)) {
            if(!peers[yourName]) {
              peers[yourName]={};
            }
            //console.log(i, j, myName, endBalance[j], endBalance[myName]);
            peers[yourName][tabNames[i]] = twoDecimals(minBalance(endBalance[j], endBalance[myName]));
          }
        }
        str += '<li onclick="showTab('+i+');" >'+tabNames[i]+' ('+endBalanceStrs.join(', ')+')</li>';
      }
    for(var i in peers) {
      havePos = 0;
      haveNeg = 0;
      for(var j in peers[i]) {
        if(peers[i][j] > 0) {
          havePos += peers[i][j];            
        }
        if(peers[i][j] < 0) {
          haveNeg += peers[i][j];
        }
      }
      if(havePos > 0 && haveNeg < 0) {
        console.log('can resolve', i, minBalance(havePos, haveNeg), JSON.stringify(peers[i]));
      }
    }
    return str+'</ul>';
  }
      
  function twoDecimals(x) {
    var r=(Math.floor(x*100+0.5)/100);
    if(r===null) {
      console.log('null twoDecimals', x, typeof(x));
    }
    return r;
  }
  function getTabTable(i) {
    var name = getTabNames()[i];
    console.log('getting name', i, name, getTabNames());
    var i, participants = remoteStorage.money.getTabParticipants(name),
      claims = remoteStorage.money.getTabClaims(name), str='<table><tr><td>Description:</td><td>by:</td><td>for:</td>'
        +'<td>amount:</td><td>currency:</td><td>'+participants.join('</td><td>')+'</td></tr>';
    for(i=0;i<claims.length;i++) {
      str += '<tr><td>'+claims[i].description
          +'</td><td>'+claims[i].by
          +'</td><td>'+claims[i].for.join(', ')
          +'</td><td>'+claims[i].amount
          +'</td><td>'+((claims[i].currency==='EUR')||(claims[i].currency===undefined)?'':claims[i].currency);
       for(j=0;j<participants.length;j++) {
         str+='</td><td>'+twoDecimals(claims[i].sums[participants[j]] || 0);
       }
       str+='</td></tr>';
    }
    return str+'</table>';
  }
  function getEndState(i) {
    var name = getTabNames()[i];
    var i, participants = remoteStorage.money.getTabParticipants(name),
      claims = remoteStorage.money.getTabClaims(name);
    return claims[claims.length-1].sums;
  }
    
  function getTabNames() {
    return tabs.getKeys();
  }
  function genUuid() {
    return Math.random()+'-'+(new Date().getTime().toString())+Math.random();
  }

  function normalizeClaim(claim) {
    if(typeof(claim.for) === 'string') {
      claim.for = [claim.for];
    }
    if(typeof(claim.currency) !== 'string') {
      claim.currency = 'EUR';
    }
    return claim;
  }
  return {
    exports: {
      _init: function() {
        tabs = SyncedMap('tabs', privateClient);
        privateClient.cache('');
      },
      addTab: function(tab) {
        var claims = {};
        for(var i=0; i<tab.claims.length; i++) {
          claims[tab.claims[i].id] = [tab.claims[i]];
        }
        tabs.set(tab.description, claims);
      },
      addClaim: function(tabName, claim) {
        console.log('addClaim', tabName, claim);
        var claims = tabs.get(tabName) || {};
        claim.id = genUuid();
        claims[claim.id] = [normalizeClaim(claim)];
        tabs.set(tabName, claims);
      },
      updateClaim: function(tabName, claimId, newObj) {
        var claims = tabs.get(tabName);
        claims[claimId].push(normalizeClaim(newObj));
        tabs.set(tabName, claims);
      },
      counterTab: function(cycle, amount) {
        var i, lastPerson = cycle[cycle.length-1];
        for (i=0; i<cycle.length; i+=2) {
          this.addClaim(cycle[i], {
            by: lastPerson,
            for: cycle[i+1],
            amount: amount
          });
          lastPerson = cycle[i+1];
        }
      },
          
      getTabNames: getTabNames,
      getTab: function(tabName) {
        return tabs.get(tabName);
      },
      getTabClaims: function(tabName) {
        var claimId, claims = [], conversion = {
          eur: 1.0,
          czk: 0.03,
          ringgit: 0.25,
          tl: 0.36,
          'try': 0.36,
          kdong: 0.03,
          usd: 0.8,
          inr: 0.012331,
          aed: 0.24,
          dram: 0.002,
          gel: 0.4
        }, i, effect, sums= {};
        for(claimId in tabs.get(tabName)) {//take the latest version of each claim
          claim=tabs.get(tabName)[claimId][tabs.get(tabName)[claimId].length-1];
          if(!conversion[claim.currency?claim.currency.toLowerCase():'eur']) {
            console.log('unsupported currency', claim.currency?claim.currency.toLowerCase():'eur');
          }
          effect=claim.amount*conversion[claim.currency?claim.currency.toLowerCase():'eur'];
          sums[claim.by]=(sums[claim.by]?sums[claim.by]:0)+effect;
          if(!claim.for) {
            console.log('claim has no .for!', tabName, claimId, claims, claim);
          }
          for(j=0;j<claim.for.length;j++) {
            sums[claim.for[j]]=(sums[claim.for[j]]?sums[claim.for[j]]:0)-(effect/claim.for.length);
          }
          //FIXME: there must be something like Object.clone() for this:
          claim.sums = {};
          for(j in sums) {
            claim.sums[j] = sums[j];
          }
          claims.push(claim);
        }
        return claims;
      },
      getTabParticipants: function(tabName) {
        var map = {}, i, j, latestVersion;
        for(i in tabs.get(tabName)) {
          latestVersion = tabs.get(tabName)[i][tabs.get(tabName)[i].length-1];
          map[latestVersion.by]=true;
          for(j=0;j<latestVersion['for'].length;j++) {
            map[latestVersion['for'][j]]=true;
          }
        }
        return Object.getOwnPropertyNames(map);
      },
      getTabTable: getTabTable,
      findCycles: findCycles,
      getTabList: getTabList,
      getCyclesGraph: getCyclesGraph,
      tabs: tabs,
      getEverything: function() {
        var promise = promising();
        promise.fulfill({
          tabs: tabs.getEverything()
        }); 
        return promise;
      },
      setEverything: function(obj) {
        if(obj && obj.tabs) {
          tabs.setEverything(obj.tabs);
        }
      },
      getEndState: getEndState,
      getEndStates: getEndStates
    }
  };
});
remoteStorage.money._init();