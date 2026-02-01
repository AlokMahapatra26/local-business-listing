
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { useRef, useEffect, useState } from "react";
import { supabase } from "../services/supabaseConfig";
import Colors from "../services/Colors";
import { SafeAreaView } from "react-native-safe-area-context";

type User = "Alok" | "Vikas" | "Deep";
type UsersData = Record<User, number>;

const USERS: User[] = ["Alok", "Vikas", "Deep"];

const formatCurrency = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
};

export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersData, setUsersData] = useState<UsersData>({
    "Alok": 0,
    "Vikas": 0,
    "Deep": 0
  });


  const debounceTimer = useRef<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      if (data) {
        const newUsersData: UsersData = { ...usersData };
        data.forEach((row: any) => {
          if (row.name && row.name in newUsersData) {
            newUsersData[row.name as User] = row.points;
          }
        });
        setUsersData(newUsersData);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  const updatePoints = async (amount: number) => {
    if (!currentUser) return;

    // Optimistic update
    const newPoints = usersData[currentUser] + amount;
    const newData = { ...usersData };
    newData[currentUser] = newPoints;
    setUsersData(newData);

    // Debounce DB update
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('users')
          .update({ points: newPoints })
          .eq('name', currentUser);

        if (error) {
          console.error("Supabase update error:", error);
          Alert.alert("Error", "Could not save to database");
        } else {
          console.log("Supabase Updated!", newPoints);
        }
      } catch (error) {
        console.error("Failed to save data", error);
      }
    }, 10000); // 10 seconds delay
  };

  const handleAbuse = () => {
    Alert.alert("Message", "laude jyda gand mein charbi chadi gayi hai");
    updatePoints(-100000); // Deduct 1 lakh
  };



  const login = (user: User) => {
    setCurrentUser(user);
  };



  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <Image
          source={require('../assets/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Who are you?</Text>
        <View style={styles.userSelectionContainer}>
          {USERS.map((user) => (
            <TouchableOpacity key={user} style={styles.userButton} onPress={() => login(user)}>
              <Text style={styles.userButtonText}>{user}</Text>
            </TouchableOpacity>
          ))}
        </View>


      </SafeAreaView>
    );
  }

  // Calculate sorted leaderboard
  const leaderboard = Object.entries(usersData)
    .sort(([, pointsA], [, pointsB]) => pointsB - pointsA);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require('../assets/logo.jpg')}
            style={styles.smallLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Davlabs ka Raja</Text>
        </View>

        <Text style={styles.welcomeText}>Hello, {currentUser}!</Text>

        <View style={styles.leaderboardContainer}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          {leaderboard.map(([name, points], index) => (
            <View key={name} style={[
              styles.leaderboardRow,
              name === currentUser && styles.currentUserRow
            ]}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <Text style={styles.leaderboardName}>{name}</Text>
              <Text style={styles.leaderboardPoints}>₹ {formatCurrency(points)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Your Score</Text>
          <Text style={styles.balanceText}>₹ {formatCurrency(usersData[currentUser])}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={() => updatePoints(1000)}>
            <Text style={styles.buttonText}>+ Add 1,000</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => updatePoints(-1000)}>
            <Text style={styles.buttonText}>- Remove 1,000</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.abuseButton} onPress={handleAbuse}>
            <Text style={styles.abuseButtonText}>maa chudaye DAVLabs</Text>
          </TouchableOpacity>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 120,
    marginBottom: 40,
  },
  smallLogo: {
    width: 100,
    height: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: Colors.primary,
  },
  userSelectionContainer: {
    width: '100%',
    gap: 15,
  },
  userButton: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: '#333',
  },

  // Dashboard Styles
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  leaderboardContainer: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 15,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  currentUserRow: {
    backgroundColor: '#e6f0ff', // Light blue highlight
    borderRadius: 8,
    paddingHorizontal: 5,
    marginHorizontal: -5,
  },
  rank: {
    fontWeight: 'bold',
    width: 30,
    color: '#888',
  },
  leaderboardName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  leaderboardPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },

  balanceContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#888',
  },
  balanceText: {
    fontSize: 48,
    fontWeight: "bold",
    color: '#333',
  },
  controls: {
    width: '100%',
    gap: 15,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.secondary,
    fontSize: 18,
    fontWeight: "600",
  },
  abuseButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  abuseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: "bold",
  },
  logoutButton: {
    marginTop: 40,
    padding: 10,
  },
  logoutText: {
    color: '#888',
    textDecorationLine: 'underline',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%'
  },
  modalButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    minWidth: 80,
    alignItems: 'center'
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 15
  },
  buttonOpen: {
    backgroundColor: Colors.primary,
  },
  buttonClose: {
    backgroundColor: "#ccc",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: 'bold'
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '100%',
    borderRadius: 5,
    borderColor: '#ddd'
  }

});