import { useEffect, useState } from "react";
import {
  View,
  Alert,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore.js";
import styles from "../../assets/styles/profile-styles.js";
import ProfileHeader from "../../components/ProfileHeader.jsx";
import LogoutButton from "../../components/LogoutButton.jsx";
import Ionicons from "@expo/vector-icons/Ionicons.js";
import COLORS from "../../constants/colors.js";
import { sleep } from "./index.jsx";
import Loader from "../../components/Loader.jsx";

export default function Profile() {
  const [books, setBooks] = useState([]);
  const [isloading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState(null);

  const router = useRouter();
  const { token } = useAuthStore();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/books/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message) || "Failed to fetch user books";

      setBooks(data);
    } catch (error) {
      console.log("Error fetching data:", error);

      Alert.alert(
        "Error",
        "Failed to load profile data. Pull down to refresh."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (bookId) => {
    try {
      setDeleteBookId(bookId);
      const response = await fetch(`${API_URL}/books/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message) || "Failed to delete book";

      setBooks(books.filter((book) => book._id !== bookId));

      Alert.alert("Success", "Book deleted successfully");
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to delete book. Please try again."
      );
    } finally {
      setDeleteBookId(null);
    }
  };

  const confirmDelete = (bookId) => {
    Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDelete(bookId),
      },
    ]);
  };

  const renderBookItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={item.image} style={styles.bookImage} />

      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {" "}
          {renderRatingStars(item.rating)}{" "}
        </View>

        <Text style={styles.bookCaption}> {item.caption} </Text>

        <Text style={styles.bookDate}>
          {" "}
          {new Date(item.createdAt).toLocaleDateString()}{" "}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item._id)}
      >
        {deleteBookId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderRatingStars = (rating) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color={i <= rating ? "#f4f400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }

    return stars;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await sleep(500);
    await fetchData();
    setRefreshing(false);
  };

  if (isloading && !refreshing) return <Loader />;

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}> My Books </Text>
        <Text style={styles.booksCount}> {books.length} books</Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={50}
              color={COLORS.textSecondary}
            />

            <Text style={styles.emptyText}>No books found</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Text style={styles.addButtonText}>Add Your first book</Text>
            </TouchableOpacity>
          </View>
        }
      ></FlatList>
    </View>
  );
}
