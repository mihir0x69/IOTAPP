var React = require('react-native');

var {
  	TouchableHighlight,
  	TimePickerAndroid,
  	DatePickerAndroid,
  	ScrollView,
  	StyleSheet,
  	TextInput,
  	ListView,
  	Platform,
  	Picker,
  	Alert,
  	Image,
  	Text,
  	View
} = React;

//get libraries
var Parse = require('parse/react-native').Parse;
var Moment = require('moment');

//get components
var ToolbarAfterLoad = require('../components/toolbarAfterLoad');
var LoadingView = require('../components/loadingview');
var ReloadView = require('../components/reloadview');
var Icon = require('react-native-vector-icons/MaterialIcons');
var Room = require('../components/room');

module.exports = React.createClass({
	getInitialState: function(){
		return{
			rawData: [],
			loaded: false,
			isReloadRequired: false,
			title: '',
			description: '',
			selectedIndex: '',
			selectedDate: new Date(),
			selectedInTime: roundToNextSlot(Moment()).format("H:m"),
			selectedOutTime: roundToNextSlot(Moment()).add(30, "minutes").format("H:m"),
		}
	},
	componentDidMount: function(){
		this.loadData();
	},
	loadData: function(){

		var _this = this;
		this.API();

		setTimeout(function(){
			if(_this.isMounted()){
				if(_this.state.loaded===false){
					_this.setState({
						isReloadRequired: true,
					})
				}
			}
		}, 15000);
	},
	API: function(){
		var _this = this;
		this.setState({ isReloadRequired: false, loaded: false });

		Parse.Cloud.run('fetchListOfRooms', {}).then(

			function(result){

				//Convert ParseObject to JSON; then push into an array.
				var cleanData = [];
				for(var i=0;i<result.length;i++){
					cleanData.push(result[i].toJSON());
				}

				console.log("[NEW BOOKING API] Success: ", cleanData);

				if(_this.isMounted()){
					_this.setState({ 
						rawData: cleanData,
						loaded: true,
						isReloadRequired: false,
						selectedIndex: cleanData[0].room_mac_id,
					});					
				}
			},
			function(error){
				_this.setState({ isReloadRequired: true, loaded: false })
				console.log("[NEW BOOKING API] Error: "+ JSON.stringify(error, null, 2));
			}
		);		
	},
	render: function(){
		if(this.state.isReloadRequired){
			return this.renderReloadView();
		}
		if(this.state.loaded === false && this.state.isReloadRequired === false){
			return this.renderLoadingView();
		}

		return(
    		<View style={styles.container}>
          		<ToolbarAfterLoad
          			navIcon={require('../../assets/images/arrow_back.png')}
	        		title={'New Booking'}
    	    		navigator={this.props.navigator}
        			sidebarRef={this}
        			isChildView={true}
      			/>
    			<ScrollView style={styles.body} keyboardShouldPersistTaps={true}>
    				<View style={styles.wizardWrapper}>
    					<View style={styles.wizardStep}>
    						<Text>Reservation Wizard</Text>
    					</View>
    					<View style={styles.wizardStep}>
	    					<View style={styles.wizardStepTitle}>
	    						<View style={{flex: 1}}>
	    							<Icon name="looks-one" size={30} color="#0288D1" />
	    						</View>
	    						<View style={{flex: 5}}>
	    							<Text style={{color: '#0288D1', fontSize: 15, marginTop: 3.7}}>Set Meeting Title</Text>
	    						</View>
	    					</View>
	    					<View style={styles.wizardstepAction}>
	    						<View style={{flex: 1}}>
	    							<Icon name="looks-one" size={30} color="#ffffff" />
	    						</View>
	    						<View style={{flex: 5}}>
	    							<TextInput 
	    								underlineColorAndroid={'#cccccc'} 
	    								style={styles.input}
	    								autoCapitalize={'words'}
	    								autoCorrect={false}
	    								onChangeText={(text) =>this.setState({title: text})}
	    							>
	    							</TextInput>
	    						</View>
	    					</View>
    					</View>
    					<View style={styles.wizardStep}>
	    					<View style={styles.wizardStepTitle}>
	    						<View style={{flex: 1}}>
	    							<Icon name="looks-two" size={30} color="#0288D1" />
	    						</View>
	    						<View style={{flex: 5}}>
	    							<Text style={{color: '#0288D1', fontSize: 15, marginTop: 3.7}}>Set Meeting Description</Text>
	    						</View>
	    					</View>
	    					<View style={styles.wizardstepAction}>
	    						<View style={{flex: 1}}>
	    							<Icon name="looks-two" size={30} color="#ffffff" />
	    						</View>
	    						<View style={{flex: 5}}>
	    							<TextInput 
	    								underlineColorAndroid={'#cccccc'} 
	    								style={styles.input}
	    								autoCapitalize={'sentences'}
	    								autoCorrect={false}
	    								onChangeText={(text) =>this.setState({description: text})}
	    							>
	    							</TextInput>
	    						</View>
	    					</View>
    					</View>
    					<View style={styles.wizardStep}>
	    					<View style={styles.wizardStepTitle}>
	    						<View style={{flex: 1}}>
	    							<Icon name="looks-3" size={30} color="#0288D1" />
	    						</View>
	    						<View style={{flex: 5}}>
	    							<Text style={{color: '#0288D1', fontSize: 15, marginTop: 3.7}}>Select Conference Room</Text>
	    						</View>
	    					</View>
	    					<View style={styles.wizardstepAction}>
	    						<View style={{flex: 1}}>
	    							<Icon name="looks-3" size={30} color="#ffffff" />
	    						</View>
	    						<View style={{flex: 5}}>
				    				<Picker 
				    					mode={"dropdown"} 
				    					selectedValue={this.state.selectedIndex}
				    					onValueChange={(index) => this.setState({ selectedIndex: index })}
				    				>
				    					{this.renderRoomList()}
				    				</Picker>
	    						</View>
	    					</View>
    					</View>
    					<View style={styles.wizardStep}>
	    					<View style={styles.wizardStepTitle}>
	    						<View style={{flex: 1}}>
	    							<Icon name="looks-4" size={30} color="#0288D1" />
	    						</View>
	    						<View style={{flex: 5}}>
	    							<Text style={{color: '#0288D1', fontSize: 15, marginTop: 3.7}}>Select Desired Date</Text>
	    						</View>
	    					</View>
	    					<View style={styles.wizardstepAction}>
	    						<View style={{flex: 1}}>
	    							<Icon name="looks-4" size={30} color="#ffffff" />
	    						</View>
	    						<View style={{flex: 5}}>
				    				<View style={styles.timeWrapper}>
				    					<TouchableHighlight onPress={this.onPressSetDate.bind(this, 'min', {date: this.state.selectedDate, minDate: new Date()})} style={styles.selectedDateTimeTouchable} underlayColor={'#e5e5e5'}>
				    						<Text style={styles.dateTime}>{Moment(this.state.selectedDate).format("MMMM Do YYYY")}</Text>
				    					</TouchableHighlight>
				    				</View>
	    						</View>
	    					</View>
    					</View>
    					<View style={styles.wizardStep}>
	    					<View style={styles.wizardStepTitle}>
	    						<View style={{flex: 1}}>
	    							<Icon name="looks-5" size={30} color="#0288D1" />
	    						</View>
	    						<View style={{flex: 5}}>
	    							<Text style={{color: '#0288D1', fontSize: 15, marginTop: 3.7}}>Select In-Out Time</Text>
	    						</View>
	    					</View>
	    					<View style={styles.wizardstepAction}>
	    						<View style={{flex: 1}}>
	    							<Icon name="looks-5" size={30} color="#ffffff" />
	    						</View>
	    						<View style={{flex: 5}}>
				    				<View style={styles.timeWrapper}>
				    					<TouchableHighlight 
				    						onPress={this.onPressSetInOutTime.bind(this, "IN", {hour: this._parseHour(this.state.selectedInTime), minute: this._parseMinute(this.state.selectedInTime)})} 
				    						style={styles.selectedDateTimeTouchable} 
				    						underlayColor={'#e5e5e5'}
				    					>
				    						<Text style={styles.dateTime}>IN: <Text style={styles.selectedDateTime}>{this._prettyPrintTime(this.state.selectedInTime)}</Text></Text>
				    					</TouchableHighlight>
				    					<TouchableHighlight 
				    						onPress={this.onPressSetInOutTime.bind(this, "OUT", {hour: this._parseHour(this.state.selectedOutTime), minute: this._parseMinute(this.state.selectedOutTime)})} 
				    						style={styles.selectedDateTimeTouchable} 
				    						underlayColor={'#e5e5e5'}
				    					>
				    						<Text style={styles.dateTime}>OUT: <Text style={styles.selectedDateTime}>{this._prettyPrintTime(this.state.selectedOutTime)}</Text></Text>
				    					</TouchableHighlight>				    					
				    				</View>
				    				<Text style={styles.note}>Adjusted to the next half-hour interval.</Text>
	    						</View>
	    					</View>
    					</View>
    					<View style={{flex: 1, justifyContent: 'flex-end', padding: 20, flexDirection: 'row'}}>
    						<TouchableHighlight 
    							underlayColor={'#f5f5f5'} 
    							style={styles.buttonTouchable}
    							onPress={this.onPressCancel}
    						>
    							<Text style={[styles.button, styles.gray]}>CANCEL</Text>
    						</TouchableHighlight>
    						<TouchableHighlight 
    							underlayColor={'#f5f5f5'} 
    							style={styles.buttonTouchable}
    							onPress={this.onPressBook}
    						>
    							<Text style={[styles.button, styles.blue]}>BOOK NOW</Text>
    						</TouchableHighlight>
    					</View>
    				</View>
    				<View style={{padding: 7}}><Text></Text></View>
    			</ScrollView>
  			</View>
		)
	},
	renderLoadingView: function(){
		return <LoadingView title={'Home'} navigator={this.props.navigator}  />
	},
	renderReloadView: function(){
		return <ReloadView title={'Home'} navigator={this.props.navigator} loadData={this.loadData} />
	},
	renderRoomList: function(){
		return this.state.rawData.map(function(room){
			return(
 				<Picker.Item label={room.room_name} value={room.room_mac_id} key={room.room_mac_id}></Picker.Item>
			);
		});		
	},
	onPressSetInOutTime: async function(mode, options){
		var {action, minute, hour} = await TimePickerAndroid.open(options);

		if(!(action === TimePickerAndroid.timeSetAction)){
			return;
		}

		if(minute>0 && minute<30){
			minute=30;
		}
		else if(minute>30){
			
			minute=0;
			
			if(hour===23){
				hour=0;
			}
			else{
				hour++;
			}
		}

		switch(mode){
			case "IN"	: 	this.setState({ selectedInTime: hour + ":" + minute });
							break;
			case "OUT"	: 	this.setState({ selectedOutTime: hour + ":" + minute });
							break;
		}
	},
	onPressSetDate: async function(mode, options){
		const {action, year, month, day} = await DatePickerAndroid.open(options);
		if (action === DatePickerAndroid.dismissedAction) {
			return;
		}
		var dateString = year + "-" + ((month+1)<10 ? "0"+(month+1) : month+1) + "-" + (day < 10 ? "0"+day : day);
		var date = new Date(dateString);
		this.setState({ selectedDate: date });
	},
	onPressCancel: function(){
		var _this = this;
		Alert.alert(
			"Confirmation", 
			"Are you sure you want to cancel?",
            [
            	{text: 'Yes', onPress: () => _this.props.navigator.pop()},
              	{text: 'No', onPress: () => console.log('Cancel Pressed!')}
            ]
		)
	},
	onPressBook: function(){
		var _this = this;

		var offset = Moment().utcOffset() / 60;

		var _bookFromTime = parseFloat((this.state.selectedInTime).replace(":", "."));
		_bookFromTime-= offset;

		var _bookToTime = parseFloat((this.state.selectedOutTime).replace(":", "."));
		_bookToTime-= offset;

		var _bookDate = Moment(this.state.selectedDate).format("D-M-YYYY");
		var _roomMacId = this.state.selectedIndex;
		var _userId = Parse.User.current().getUsername();
		var _title = this.state.title;
		var _description = this.state.description;
		var _statusId = 1;

		Parse.Cloud.run('bookRoomFromAppCloudFunction', 
			{
				book_fromtime: _bookFromTime,
				book_totime: _bookToTime,
				book_date: _bookDate,
				room_mac_id: _roomMacId,
				user_id: _userId,
				title: _title,
				description: _description,
				status_id: _statusId

			}).then(

				function(result){
					console.log("[NEW BOOKING API] Success: "+ JSON.stringify(result, null, 2));
				},
				function(error){
					console.log("[NEW BOOKING API] Error: "+ JSON.stringify(error, null, 2));
				}
			);		
	},
	_parseHour: function(time){
		return parseInt(time.slice(0, time.indexOf(":")));
	},
	_parseMinute: function(time){
		return parseInt(time.substr(time.indexOf(":") + 1));
	},
	_prettyPrintTime: function(time){
		var hour = this._parseHour(time);
		var minute = this._parseMinute(time);

		hour = hour < 9 ? "0" + hour : hour.toString();
		minute = minute < 9 ? "0" + minute : minute.toString();
		return hour + ":" + minute;
	}
});

function roundToNextSlot(start){
	var ROUNDING = 30 * 60 * 1000; /*ms*/
	start = Moment(Math.ceil((+start) / ROUNDING) * ROUNDING);
	return start;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	body: {
		flex: 1,
		backgroundColor: '#e8e8e8',
		padding: 10,
	},
	wizardWrapper: {
		backgroundColor: '#ffffff',
	},
	wizardStep: {
		borderBottomWidth: 1,
		borderBottomColor: '#f5f5f5',
		padding: 15,
	},
	wizardStepTitle: {
		flexDirection: 'row',
	},
	wizardstepAction: {
		flexDirection: 'row'
	},
	selectedDateTimeTouchable: {
		padding: 10
	},
	dateTime:{
		color: '#000000',
		fontSize: 16
	},
	selectedDateTime: {
		color: '#999999',
		fontSize: 16
	},
	timeWrapper: {
		flexDirection: 'row',
		marginBottom: 5
	},
	input: {
		padding: 4,
		height: 40,
		fontSize: 16,
	},
	note: {
		color: '#939393',
		fontSize: 12,
		fontStyle: 'italic'
	},
	button: {
		borderRadius: 2,
		marginTop: 5,
		marginRight: 10,
		marginBottom: 5,
		marginLeft: 10,
		fontSize: 15
	},
	buttonTouchable: {
		borderRadius: 2
	},
	blue: {
		color: '#0288D1',
	},
	gray: {
		color: '#939393',
	}
})