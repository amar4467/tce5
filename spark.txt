Experiment 10A — Apache Spark Implementation
Step 1: Update Ubuntu
Open Terminal (Ctrl + Alt + T).
sudo apt update


Step 2: Install Java
sudo apt install openjdk-17-jdk -y


Verify:
java -version


Step 3: Install Scala
sudo apt install scala -y


Verify:
scala -version


Step 4: Download Apache Spark
Go to Downloads:
cd ~/Downloads


Download Spark:
wget https://archive.apache.org/dist/spark/spark-3.5.8/spark-3.5.8-bin-hadoop3.tgz


Verify downloaded file:
ls


Step 5: Extract Spark
tar -xvzf spark-3.5.8-bin-hadoop3.tgz


Move Spark to /usr/local/spark:
sudo mv spark-3.5.8-bin-hadoop3 /usr/local/spark


Verify:
ls /usr/local/spark


Step 6: Configure Spark environment
Open the Bash configuration:
nano ~/.bashrc


Add these lines at the bottom:
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export SPARK_HOME=/usr/local/spark
export PATH=$PATH:$JAVA_HOME/bin:$SPARK_HOME/bin:$SPARK_HOME/sbin


Save using Ctrl + O, Enter, and Ctrl + X.
Apply changes:
source ~/.bashrc


Verify:
echo $SPARK_HOME


Expected:
/usr/local/spark


Step 7: Start Spark
spark-shell


If successful, the Spark banner appears and you get a Scala prompt.
Exit:
:quit


Part A — Spark CLI Word Count
Step 8: Create a folder
mkdir -p ~/spark_lab
cd ~/spark_lab


Step 9: Create input.txt
nano input.txt


Paste the input text from your PDF:
In as name to here them deny wise this. As rapid woody my he me which. Men but they fail shew just wish next put. Led all visitor musical calling nor her. Within coming figure sex things are. Pretended concluded did repulsive education smallness yet yet described. Had countryman his pressed shewing. No gate dare rose he. Eyes year if miss he as upon.


Save and exit.
Verify:
cat input.txt


Step 10: Open Spark Shell
spark-shell


Now execute these commands inside Spark Shell.
Read input
val inputfile = sc.textFile("input.txt")


Word Count
val counts = inputfile.flatMap(line => line.split(" "))
    .map(word => (word, 1))
    .reduceByKey(_ + _)


Display result
counts.collect().foreach(println)


Save result
counts.saveAsTextFile("output")


Exit
:quit


Step 11: View output
Back in Ubuntu Terminal:
ls


cd output


ls


cat part-*


You should see word counts similar to:
(he,2)
(yet,2)
(as,1)


Part B — Spark Scala Program
Step 12: Return to working folder
cd ~/spark_lab


Step 13: Create Scala program
nano SparkWordCount.scala


Paste this complete program, adapted from your PDF to use Spark's modern configuration:
import org.apache.spark.SparkContext
import org.apache.spark.SparkConf

object SparkWordCount {
    def main(args: Array[String]): Unit = {

        val conf = new SparkConf()
            .setAppName("Word Count")
            .setMaster("local[*]")

        val sc = new SparkContext(conf)

        val input = sc.textFile("input.txt")

        val count = input.flatMap(line => line.split(" "))
            .map(word => (word, 1))
            .reduceByKey(_ + _)

        count.saveAsTextFile("outfile")

        println("OK")

        sc.stop()
    }
}


Save and exit.
Step 14: Create executable Spark script
To run directly without compiling a JAR, create a Spark Shell script:
nano wordcount.scala


Paste:
val input = sc.textFile("input.txt")

val count = input.flatMap(line => line.split(" "))
    .map(word => (word, 1))
    .reduceByKey(_ + _)

count.collect().foreach(println)

count.saveAsTextFile("outfile")

println("OK")


Save and exit.
Step 15: Execute Scala script
spark-shell -i wordcount.scala


Expected final message:
OK


Exit:
:quit


Step 16: View program output
cd ~/spark_lab


cat outfile/part-*


Part C — Run the full Scala object using spark-submit
This section is needed if your lab examiner asks you to execute the actual SparkWordCount.scala program rather than the Spark Shell script.
Step 17: Create an SBT project
Return to your lab folder:
cd ~/spark_lab
mkdir -p wordcount_project/src/main/scala
cd wordcount_project


Copy your program:
cp ../SparkWordCount.scala src/main/scala/


Create the build configuration:
nano build.sbt


Paste:
name := "SparkWordCount"

version := "1.0"

scalaVersion := "2.12.18"

libraryDependencies += "org.apache.spark" %% "spark-core" % "3.5.8" % "provided"


You need SBT installed and internet access for the initial dependency download. With SBT available, run:
sbt package


This creates a JAR under:
target/scala-2.12/


Step 18: Execute using spark-submit
Return to the lab directory so input.txt can be found:
cd ~/spark_lab


Run:
spark-submit \
  --class SparkWordCount \
  --master local[*] \
  wordcount_project/target/scala-2.12/sparkwordcount_2.12-1.0.jar


Expected:
OK


View output:
cat outfile/part-*


If you previously executed Part B, remove the existing output folder before Step 18:
rm -r outfile