import React, { Component } from 'react';
import { Card, Title, Paragraph } from 'react-native-paper';
import { Header } from 'react-native-elements';
import { TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

 
import {
  Text,
  StyleSheet,
  View,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
//import all the components we are going to use.
 
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      isLoading: true, 
      text: '', 
      list: true, 
      token: '', 
      detail: '', 
      image_detail: '', 
      address: '', 
      groupActivity: '' ,
      days: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ]
    };
    this.arrayholder = [];
  }
 
  componentDidMount() {
    var opts = {
      grant_type: 'client_credentials',
      client_id: '0vCQowPnun8UHLmIeoWhr2Cs17xVcY34loiA8Kd6',
      client_secret: 'oRXrdH4jdfRS4rZ5PrfpwwQ549EYpSS47r0xRt9X75eq4zcrd9uUOYU2JvMiur4blUzgTII3nxjvK49HIOfqF58xweEuWdkHDHPTF8KtH6V2bIdY4Ss4iq6440svbzUS'
    }
    var token = ''
    fetch('http://snorlax.tempat.com/api/v1/auth/token', {
      method: 'POST',
      headers: new Headers({
          'Content-type': 'application/json'
      }), 
      body: JSON.stringify(opts),
    }).then((response) => response.json())
    .then((data) => {
        this.setState({token: data.access_token})
      if(data && data.access_token){
        fetch('http://snorlax.tempat.com/api/v2/search?page=1&per_page=20&query=coffee&class=provinsi&idx=11', {
          method: 'GET',
          headers: new Headers({
            'Authorization': 'Bearer '+data.access_token,
            'Content-type': 'application/json'
          }), 

        }).then((response) => response.json())
        .then((data) => {
            this.setState(
              {
                isLoading: false,
                dataSource: data.data
              },
            );
        })
        .catch((error) => {
            console.log(error)
        });
      }
    })
    .catch((error) => {
      console.log(error)
    });
    console.log(token)
    
  }
  ListViewItemSeparator = () => {
    //Item sparator view
    return (
      <View
        style={{
          height: 0.3,
          width: '90%',
          backgroundColor: '#080808',
        }}
      />
    );
  };
  detail(val){
    this.setState({list: false})
    fetch('http://snorlax.tempat.com/api/v2/branch/'+val._source.slug, {
      method: 'GET',
      headers: new Headers({
        'Authorization': 'Bearer '+this.state.token,
        'Content-type': 'application/json'
      }), 

    }).then((response) => response.json())
    .then((data) => {
        this.setState({
          detail: data.data, 
          image_detail: data.data.branch_images.all[0].image_url, 
          address: data.data.building.properties.address,
          groupActivity: data.data.branch_group_activity[0].activity_group.group_name,
          facility: data.data.facilities,
          jam: data.data.operational_hours
        })
    })
    .catch((error) => {
        console.log(error)
    });
  }
  back(){
    this.setState({list: true})
  }
  render() {
    if (this.state.isLoading) {
      //Loading View while data is loading
      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      //ListView to show with textinput used as search bar
      <View style={styles.vuePrimary}>
        <ScrollView>
          { this.state.list ? 
            <View style={styles.viewStyle}>
              <Header
                centerComponent={
                  { 
                    text: 'Tempat.com', 
                    style: { color: '#fff', fontSize: 18 } 
                  }
              }
              />
              <View style={styles.cont}>
                { this.state.dataSource && this.state.dataSource.length > 0 ?
                  <FlatList
                    data={this.state.dataSource}
                    ItemSeparatorComponent={this.ListViewItemSeparator}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                      onPress={() => this.detail(item)}>

                        <Card style={styles.card}>
                          <Card.Content style={styles.content}>
                            <Title>{item._source.branch_name}</Title>
                            <Paragraph>{item._source.administration_address}</Paragraph>
                          </Card.Content>
                          <Card.Cover source={{ uri: item._source.branch_images.image_url }} />
                        </Card>
                      </TouchableOpacity>
                    )}

                    enableEmptySections={true}
                    style={{ marginTop: 10 }}
                    keyExtractor={(item, index) => index.toString()}
                  />
                :
                  <View></View>
                }
              </View>
            </View>
          :
            <View>
              <Header
                leftComponent={{ icon: 'keyboard-arrow-left', color: '#fff', size: 30, onPress: () => this.back()}}
                centerComponent={{ text: this.state.detail.branch_name, style: { color: '#fff', fontSize: 18 } }}
              />
              <Card style={styles.cardDetail}>
                <Card.Cover source={{ uri: this.state.image_detail }} style={styles.image_detail} />
                <Card.Content>
                  <Title>{this.state.detail.branch_name}</Title>
                  <View style={styles.rating_box}>
                    <Text style={styles.rating}>
                      <Icon name="star" size={12} color="#fff"/>
                      {'  '+this.state.detail.rating_score}
                    </Text>
                  </View>
                  <Paragraph style={styles.add_detail}>{this.state.address}</Paragraph>
                  <Paragraph style={styles.category}>{this.state.groupActivity}</Paragraph>
                </Card.Content>
              </Card>
              <View style={styles.about}>
                <Title style={styles.title_category}>Tentang</Title>
                <View style={styles.groupAbout}>
                  <Text style={styles.subtitle}>
                    Tipe Restoran
                  </Text>
                  <Text>
                    {this.state.groupActivity}
                  </Text>
                </View>
                <View style={styles.groupAbout}>
                  <Text style={styles.subtitle}>
                    Rata-rata Harga
                  </Text>
                  <Text>
                    {this.state.detail.price_info}
                  </Text>
                </View>
                <View style={styles.facilitiess}>
                  <Text style={styles.subtitle}>Fasilitas</Text>
                  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <View style={styles.faclist}>
                      { this.state.facility ? 
                        this.state.facility.map((datas, key) => 
                        ( 
                        <View style={{marginHorizontal: 10, justifyContent: 'center', alignItems: 'center'}}> 
                          <Image
                            style={{height: 30, width: 30}}
                            source={{uri: 'https://tempat.com/img/icons/Profile.png'}}
                          />
                          <Text style={{fontSize: 10}}>{datas.facility.name}</Text>
                        </View>
                        ))
                        :
                        <View></View>
                      }
                    </View>
                  </ScrollView>
                </View>
                <View style={styles.groupAbout}>
                  <Text style={styles.subtitle}>
                    Jam Operasional
                  </Text>
                  <View>
                    { this.state.jam && this.state.jam.length > 0? 
                      this.state.jam.map((datas, key) =>
                      (
                        <Text style={{marginBottom: 10, fontSize: 11}}>
                          {this.state.days[datas.day]} : Pukul {datas.hour_start.slice(0, 5)} - {datas.hour_end.slice(0, 5)}
                        </Text>
                      ))
                      :
                        <View><Text>-</Text></View>
                    }
                  </View>
                </View>
                <View style={styles.groupAbout}> 
                  <Text style={styles.subtitle}>
                    Informasi Lainnya
                  </Text>
                  <Text style={{fontSize: 11}}>
                    {this.state.detail.payment_info}
                  </Text>
                </View>
              </View>
            </View>
          }
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  vuePrimary: {
    flex: 1,
  },
  viewStyle: {
    justifyContent: 'center',
    flex: 1,
  },
  textStyle: {
    padding: 10,
  },
  textInputStyle: {
    height: 40,
    borderWidth: 1,
    paddingLeft: 10,
    borderColor: '#009688',
    backgroundColor: '#FFFFFF',
    borderRadius: 20, 
    width: '70%',
    marginRight: 10
  },
  card: {
    marginBottom: 50
  },
  content: {
    marginLeft: -15,
    marginBottom: 10
  },
  cont: {
    padding: 10
  },
  add_detail: {
    fontSize: 12
  },
  rating_box: {
    backgroundColor: '#FDA509',
    borderWidth: 0,
    borderRadius: 50,
    padding: 5,
    width: 50
  },
  rating: {
    color: '#fff',
    fontSize: 12
  },
  category: {
    color: '#B4B3BA',
    fontSize: 11,
  },
  cardDetail: {
  },
  about: {
    padding: 10
  },
  title_category: {
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#5D5D6A'
  },
  groupAbout: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D5D5D5'
  },
  image_detail: {
    height: 250,
    padding: 10
  },
  faclist: {
    flex: 1,
    flexDirection: 'row'
  },
  facilitiess: {
    paddingVertical: 10, 
    width: '100%', 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#D5D5D5'
  }
});