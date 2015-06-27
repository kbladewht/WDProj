package com.ht.DAO.base;

import java.lang.reflect.Field;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

public class JDBCAbstractBuilder {

	int batchSize = 10000;

	List<Field> fields;
	protected Connection connection;

	public void clearConn(Connection connection, ResultSet rs, Statement cs) {

		if (rs != null) {
			try {
				rs.close();
			} catch (SQLException e) {
			}
		}

		if (cs != null) {
			try {
				cs.close();
			} catch (SQLException e) {
			}
		}

		if (connection != null) {
			try {
				connection.close();
			} catch (SQLException e) {
			}
		}

	}

	public String getDuringTime(long startTime) {
		return (System.currentTimeMillis() - startTime) / 1000 + "." + (System.currentTimeMillis() - startTime) % 1000;
	}

}
